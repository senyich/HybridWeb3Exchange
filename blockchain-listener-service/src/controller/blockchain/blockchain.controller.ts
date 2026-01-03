/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Param,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { BlockchainService } from '../../service/blockchain/blockchain.service';
import { ethers } from 'ethers';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('balance/:address')
  async getUserBalance(@Param('address') address: string) {
    if (!ethers.isAddress(address)) {
      throw new BadRequestException('Некорректный Ethereum адрес');
    }
    try {
      const balance = await this.blockchainService.getChainBalance(address);
      return {
        success: true,
        data: {
          address: address,
          balance: balance,
          symbol: 'ETH'
        }
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Ошибка при получении баланса из блокчейна');
    }
  }
}