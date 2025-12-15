import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { FundSchema, TransferSchema } from "./wallet.schema";
import { WalletService } from "./wallet.service";

@Controller("wallet")
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post("")
  async createWallet() {
    return await this.walletService.createWallet();
  }

  @Get(":walletId")
  async getWallet(@Param("walletId") walletId: string) {
    return await this.walletService.getWallet(walletId);
  }

  @Post("fund")
  async fundWallet(
    @Body(new ZodValidationPipe(FundSchema))
    body,
  ) {
    return await this.walletService.fundWallet(body);
  }

  @Post("transfer")
  async transferFunds(
    @Body(new ZodValidationPipe(TransferSchema))
    body,
  ) {
    return await this.walletService.transfer(body);
  }

  @Get(":walletId/transactions")
  async getTransactions(@Param("walletId") walletId: string, @Req() req) {
    return await this.walletService.getWalletTransactions(req.query, walletId);
  }
}
