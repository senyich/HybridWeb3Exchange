/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { ConnectKitButton } from "connectkit";
import { ExchangeBaseABI } from '../config/contractsAbis';

export const Dashboard = () => {
  const { address } = useAccount();
  const { data: contractBalance } = useReadContract({
    address: '0xd7B03a6B1240a1eDe5B48b0165FE45FEE007947E',
    abi: ExchangeBaseABI,
    functionName: 'getBalance',
    args: [address],
  });

  return (
    <div className="min-h-screen bg-dark-radial text-white p-8">
      <nav className="flex justify-between items-center mb-10 border-b border-purple-dark pb-5">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-neon-glow animate-pulse-glow">
          DIPLOMA EXCH
        </h1>
        <ConnectKitButton />
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-custom-violet-night p-6 rounded-xl border border-purple-neon shadow-neon-purple">
          <h2 className="text-purple-electric mb-2">Contract Balance</h2>
          <p className="text-4xl font-mono">{contractBalance?.toString() || '0'} ETH</p>
        </div>
        {/* Здесь будут компоненты OrderForm и OrderBook */}
      </div>
    </div>
  );
};