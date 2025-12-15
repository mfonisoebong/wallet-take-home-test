import { Injectable } from "@nestjs/common";
import crypto from "crypto";
import { STATUS_CODE } from "@/enums/status-codes";
import { prisma } from "@/lib/prisma";
import {
  generateTransactionReference,
  HttpResponse,
  httpResponse,
  paginatedData,
} from "@/lib/utils";
import { $Enums } from "../../generated/prisma/client";
import { TransactionResource, WalletResource } from "./wallet.resources";
import {
  FundSchema,
  FundSchemaType,
  TransferSchemaType,
} from "./wallet.schema";

@Injectable()
export class WalletService {
  private hashRequest(payload: any) {
    const json = JSON.stringify(payload ?? {});
    return crypto.createHash("sha256").update(json).digest("hex");
  }

  // Handles idempotent operations

  private async withIdempotency<T>(
    idempotencyKey: string | undefined,
    operation: string,
    requestData: any,
    executor: (tx: any) => Promise<HttpResponse<T>>,
  ) {
    // Always run inside a DB transaction for consistency
    if (!idempotencyKey) {
      return prisma.$transaction(async (tx) => executor(tx));
    }

    const requestHash = this.hashRequest({ operation, requestData });

    return prisma.$transaction(async (tx: any) => {
      // Try to create an idempotency record; if it exists, decide what to return
      let created = false;
      try {
        await tx.idempotency.create({
          data: {
            key: idempotencyKey,
            operation,
            requestHash,
            status: "PENDING",
          },
        });
        created = true;
      } catch (e) {
        // Duplicate or other error; fetch existing
        const existing = await tx.idempotency.findUnique({
          where: { key: idempotencyKey },
        });
        if (existing) {
          if (
            existing.operation !== operation ||
            existing.requestHash !== requestHash
          ) {
            return httpResponse({
              code: STATUS_CODE.CONFLICT,
              message: "Idempotency key reused with different request",
            });
          }
          if (existing.status === "COMPLETED" && existing.response) {
            return existing.response as import("@/lib/utils").HttpResponse<T>;
          }
          return httpResponse({
            code: STATUS_CODE.CONFLICT,
            message: "Operation with this idempotency key is in progress",
          });
        }
        // If no existing, rethrow
        throw e;
      }

      const response = await executor(tx);

      if (created) {
        await tx.idempotency.update({
          where: { key: idempotencyKey },
          data: { status: "COMPLETED", response },
        });
      }

      return response;
    });
  }
  async createWallet() {
    // Default values are set in the database schema
    const wallet = await prisma.wallet.create({ data: {} });

    return httpResponse({
      data: new WalletResource(wallet).toJson(),
      message: "Wallet created successfully",
    });
  }

  async getWallet(walletId: string) {
    const wallet = await this.checkWallet(walletId);

    if (!wallet) {
      return httpResponse({
        message: "Wallet not found",
        code: STATUS_CODE.NOT_FOUND,
      });
    }

    return httpResponse({
      data: new WalletResource(wallet).toJson(),
      message: "Wallet retrieved successfully",
    });
  }

  async fundWallet(data: FundSchemaType, idempotencyKey?: string) {
    const wallet = await this.checkWallet(data.walletId);

    if (!wallet) {
      return httpResponse({
        message: "Wallet not found",
        code: STATUS_CODE.NOT_FOUND,
      });
    }
    const newBalance = wallet.balance + data.amount;

    const result = await this.withIdempotency(
      idempotencyKey,
      "FUND",
      data,
      async (tx) => {
        const updatedWallet = await tx.wallet.update({
          where: { id: data.walletId },
          data: { balance: newBalance },
        });

        const transaction = await tx.transaction.create({
          data: {
            amount: data.amount,
            walletId: data.walletId,
            type: $Enums.TransactionType.DEPOSIT,
            reference: generateTransactionReference(),
          },
        });

        return httpResponse({
          message: "Wallet funded successfully",
          data: { wallet: updatedWallet, transaction },
        });
      },
    );

    return result;
  }

  async transfer(data: TransferSchemaType, idempotencyKey?: string) {
    const fromWallet = await this.checkWallet(data.from);
    const toWallet = await this.checkWallet(data.to);

    if (!fromWallet || !toWallet) {
      return httpResponse({
        message: "One or both wallets not found",
        code: STATUS_CODE.NOT_FOUND,
      });
    }

    // Prevent negative balances
    if (fromWallet.balance < data.amount) {
      return httpResponse({
        message: "Insufficient funds in the source wallet",
        code: STATUS_CODE.BAD_REQUEST,
      });
    }
    const newFromBalance = fromWallet.balance - data.amount;
    const newToBalance = toWallet.balance + data.amount;

    const result = await this.withIdempotency(
      idempotencyKey,
      "TRANSFER",
      data,
      async (tx) => {
        await tx.wallet.update({
          where: { id: data.from },
          data: { balance: newFromBalance },
        });
        await tx.wallet.update({
          where: { id: data.to },
          data: { balance: newToBalance },
        });
        await tx.transaction.create({
          data: {
            amount: data.amount,
            walletId: data.from,
            type: $Enums.TransactionType.WITHDRAWAL,
            reference: generateTransactionReference(),
          },
        });
        await tx.transaction.create({
          data: {
            amount: data.amount,
            walletId: data.to,
            type: $Enums.TransactionType.DEPOSIT,
            reference: generateTransactionReference(),
          },
        });

        return httpResponse({ message: "Transfer completed successfully" });
      },
    );

    return result;
  }

  async getWalletTransactions(query, walletId: string) {
    const total = await prisma.transaction.count({
      where: {
        walletId: walletId,
      },
    });
    const meta = paginatedData(query, total);
    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: walletId,
      },
      skip: meta.skip,
      take: meta.perPage,
      orderBy: {
        createdAt: "desc",
      },
    });
    const data = TransactionResource.collection(transactions);

    return httpResponse({
      data: {
        meta,
        data,
      },
      message: "Transactions retrieved successfully",
    });
  }
  private async checkWallet(walletId: string) {
    return await prisma.wallet.findUnique({
      where: { id: walletId },
    });
  }
}
