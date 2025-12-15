import { JsonValue } from "@prisma/client/runtime/client";
import { $Enums, Prisma } from "../../generated/prisma/client";
import { ResourceInterface } from "../common/interfaces/resource";

export type WalletResourceType = {
  id: string;
  currency: $Enums.Currency;
  balanceFormatted: string;
  balance: number;
};

export type TransactionResourceType = {
  id: string;
  amount: number;
  type: $Enums.TransactionType;
  walletId: string;
  createdAt: Date;
  metadata?: JsonValue;
};

export class WalletResource implements ResourceInterface<WalletResourceType> {
  constructor(public item: Prisma.WalletGetPayload<{}>) {}

  toJson(): WalletResourceType {
    return this.extractObject();
  }

  static collection(
    items: Prisma.WalletGetPayload<{}>[],
  ): WalletResourceType[] {
    const instance = new WalletResource(items[0]);
    return items.map((item) => instance.extractObject(item));
  }

  extractObject(data?: typeof this.item): WalletResourceType {
    if (!data) {
      return {
        id: this.item.id,
        currency: this.item.currency,
        balance: this.item.balance,
        balanceFormatted: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: this.item.currency,
        }).format(this.item.balance),
      };
    }

    return {
      id: data.id,
      currency: data.currency,
      balance: data.balance,
      balanceFormatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: data.currency,
      }).format(data.balance),
    };
  }
}

export class TransactionResource
  implements ResourceInterface<TransactionResourceType>
{
  constructor(public item: Prisma.TransactionGetPayload<{}>) {}
  toJson(): TransactionResourceType {
    return this.extractObject();
  }
  static collection(
    items: Prisma.TransactionGetPayload<{}>[],
  ): TransactionResourceType[] {
    const instance = new TransactionResource(items[0]);
    return items.map((item) => instance.extractObject(item));
  }

  extractObject(data?: typeof this.item): TransactionResourceType {
    if (!data) {
      return {
        id: this.item.id,
        amount: this.item.amount,
        type: this.item.type,
        walletId: this.item.walletId,
        createdAt: this.item.createdAt,
        metadata: this.item.metadata,
      };
    }
    return {
      id: data.id,
      amount: data.amount,
      type: data.type,
      walletId: data.walletId,
      createdAt: data.createdAt,
      metadata: data.metadata,
    };
  }
}
