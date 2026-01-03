/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract, JsonRpcProvider } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: JsonRpcProvider;
  private contract: Contract;
  private contractAbi: string[] = [
    'event Deposit(address indexed user, uint256 amount)',
    'event Withdraw(address indexed user, uint256 amount)',
    'function getBalance(address user) view returns (uint256)',
  ];
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initContract();
    this.startListening();
  }
  private initContract() {
    const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    if (!rpcUrl || !contractAddress) {
      throw new Error('Missing RPC URL or Contract Address in ENV');
    }
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(contractAddress, this.contractAbi, this.provider);
    this.logger.log(
      `Blockchain Service initialized for contract: ${contractAddress}`,
    );
  }

  private startListening() {
    void this.contract.on('Deposit', (user, amount, event) => {
      const formattedAmount = ethers.formatEther(amount);
      const txHash = event.log.transactionHash;
      this.logger.log(
        `🚀 New Deposit Detected! User: ${user}, Amount: ${formattedAmount} ETH`);
    });
    this.contract.on('Withdraw', (user, amount, event) => {
       const formattedAmount = ethers.formatEther(amount);
       this.logger.warn(`🔻 Withdrawal: User: ${user}, Amount: ${formattedAmount} ETH`);
    });
  }
  async getChainBalance(userAddress: string): Promise<string> {
    const balance = await this.contract.getBalance(userAddress);
    return ethers.formatEther(balance);
  }
}