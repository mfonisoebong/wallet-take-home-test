import { Injectable } from "@nestjs/common";
import { $Enums } from "generated/prisma/client";
import { STATUS_CODE } from "@/enums/status-codes";
import { prisma } from "@/lib/prisma";
import { httpResponse, paginatedData } from "@/lib/utils";
import { TransactionResource, WalletResource } from "./wallet.resources";
import {
  FundSchema,
  FundSchemaType,
  TransferSchemaType,
} from "./wallet.schema";

@Injectable()
export class WalletService {
  async createWallet() {
    // Default values are set in the database schema
    const wallet = await prisma.wallet.create({});
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

  async fundWallet(data: FundSchemaType) {
    const wallet = await this.checkWallet(data.walletId);

    if (!wallet) {
      return httpResponse({
        message: "Wallet not found",
        code: STATUS_CODE.NOT_FOUND,
      });
    }
    const newBalance = wallet.balance + data.amount;

    // Using transaction to ensure consistency in case of any failure during the operations
    const updatedData = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: data.walletId },
        data: { balance: newBalance },
      });

      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          walletId: data.walletId,
          type: $Enums.TransactionType.DEPOSIT,
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    });

    return httpResponse({
      message: "Wallet funded successfully",
      data: updatedData,
    });
  }

  async transfer(data: TransferSchemaType) {
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

    await prisma.$transaction(async (tx) => {
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
        },
      });
      await tx.transaction.create({
        data: {
          amount: data.amount,
          walletId: data.to,
          type: $Enums.TransactionType.DEPOSIT,
        },
      });
    });

    return httpResponse({
      message: "Transfer completed successfully",
    });
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
