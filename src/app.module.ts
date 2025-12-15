import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WalletModule } from "./wallet/wallet.module";

const THROTTLE_LIMIT = 20;
const THROTTLE_TTL = 60000;

@Module({
	imports: [
		ThrottlerModule.forRoot({
			throttlers: [
				{
					// Rate limit 15 requests per minute
					ttl: THROTTLE_TTL,
					limit: THROTTLE_LIMIT,
				},
			],
		}),
		WalletModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
