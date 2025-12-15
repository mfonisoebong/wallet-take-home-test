import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { STATUS_CODE } from "@/enums/status-codes";
import { errorParser, httpResponse } from "@/lib/utils";
import { FundSchema, TransferSchema } from "./wallet.schema";
import { WalletService } from "./wallet.service";

@Controller("wallet")
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post("")
  async createWallet() {
    try {
      return await this.walletService.createWallet();
    } catch (err) {
      return httpResponse({
        code: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Failed to create wallet",
        data: errorParser(err),
      });
    }
  }

  @Get(":walletId")
  async getWallet(@Param("walletId") walletId: string) {
    try {
      return await this.walletService.getWallet(walletId);
    } catch (err) {
      return httpResponse({
        code: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve wallet",
        data: errorParser(err),
      });
    }
  }

  @Post("fund")
  async fundWallet(
    @Body(new ZodValidationPipe(FundSchema))
    body,
    @Headers("Idempotency-Key") idempotencyKey?: string,
  ) {
    try {
      return await this.walletService.fundWallet(body, idempotencyKey);
    } catch (err) {
      return httpResponse({
        code: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Failed to fund wallet",
        data: errorParser(err),
      });
    }
  }

  @Post("transfer")
  async transferFunds(
    @Body(new ZodValidationPipe(TransferSchema))
    body,
    @Headers("Idempotency-Key") idempotencyKey?: string,
  ) {
    try {
      return await this.walletService.transfer(body, idempotencyKey);
    } catch (err) {
      return httpResponse({
        code: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Failed to transfer funds",
        data: errorParser(err),
      });
    }
  }

  @Get(":walletId/transactions")
  async getTransactions(@Param("walletId") walletId: string, @Req() req) {
    try {
      return await this.walletService.getWalletTransactions(
        req.query,
        walletId,
      );
    } catch (err) {
      return httpResponse({
        code: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve transactions",
        data: errorParser(err),
      });
    }
  }
}
