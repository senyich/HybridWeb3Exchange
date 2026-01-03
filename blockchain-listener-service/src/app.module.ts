/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BlockchainService } from './service/blockchain/blockchain.service';
import { ConfigModule } from '@nestjs/config';
import { BlockchainController } from './controller/blockchain/blockchain.controller';
@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', 
    }),],
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class AppModule {}
