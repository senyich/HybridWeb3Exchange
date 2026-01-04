/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatEther } from "viem";
import { ConnectKitButton } from "connectkit";
import { ExchangeBaseABI } from "../config/contractsAbis";

const CONTRACT_ADDRESS = import.meta.env.VITE_EXCHANGE_CONTRACT_ADDRESS as `0x${string}`;

export const Dashboard = () => {
  const { address, isConnected } = useAccount();

  const { data: walletBalance } = useBalance({
    address: address,
  });

  const { data: totalLiquidity } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ExchangeBaseABI,
    functionName: "getContractTotalBalance",
  });

  const displayWalletBalance = walletBalance?.value 
    ? parseFloat(formatEther(walletBalance.value)).toFixed(4) 
    : "0.0000";

  const displayTotalLiquidity = totalLiquidity !== undefined 
    ? parseFloat(formatEther(totalLiquidity)).toFixed(2) 
    : "0.00";

  const StatCard = ({ title, value, unit, glowColor = "purple" }: any) => (
    <div className={`bg-custom-violet-night p-6 rounded-2xl border border-purple-dark shadow-neon-${glowColor} transition-all duration-300 hover:scale-[1.02]`}>
      <h3 className="text-purple-electric text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-mono font-bold tracking-tighter text-white">
          {value}
        </span>
        <span className="text-purple-light text-sm font-semibold uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-radial text-white p-6 md:p-12 font-sans selection:bg-purple-deep">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="relative group">
          <h1 className="text-4xl font-black tracking-tighter italic text-transparent bg-clip-text bg-neon-glow animate-pulse-glow">
            Ru.HEX
          </h1>
          <div className="absolute -bottom-2 left-0 w-0 h-1 bg-purple-neon transition-all duration-500 group-hover:w-full shadow-neon-purple"></div>
        </div>
        <div className="scale-110">
          <ConnectKitButton />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-2">
          <h2 className="text-5xl font-extrabold tracking-tight">
            Personal <span className="text-purple-electric italic">Cabinet</span>
          </h2>
          <p className="text-purple-light/60 font-medium">Monitoring hybrid liquidity and asset distribution</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            title="External Wallet" 
            value={displayWalletBalance} 
            unit="ETH"
            glowColor="purple"
          />

          <StatCard 
            title="Total Platform Liquidity" 
            value={displayTotalLiquidity} 
            unit="ETH"
            glowColor="purple"
          />
        </div>

        <section className="mt-12 overflow-hidden rounded-3xl border border-purple-dark/50 bg-black/20 backdrop-blur-xl">
          <div className="p-8 border-b border-purple-dark/50 flex justify-between items-center">
            <h3 className="text-xl font-bold italic tracking-wider">Asset Overview</h3>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-neon animate-pulse"></div>
              <div className="h-2 w-2 rounded-full bg-crimson-neon animate-pulse delay-75"></div>
            </div>
          </div>
          <div className="p-8">
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-purple-dark/30 rounded-2xl">
                <p className="text-purple-light/40 italic mb-4 text-lg">Identity not confirmed via Web3</p>
                <ConnectKitButton />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-xl bg-purple-dark/10 border border-purple-dark/20 hover:bg-purple-dark/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-deep to-crimson-neon flex items-center justify-center font-bold">Ξ</div>
                    <div>
                      <p className="font-bold">Ethereum (Native)</p>
                      <p className="text-[10px] text-purple-light/50 font-mono break-all">{address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-lg text-purple-electric">
                      {displayWalletBalance}
                    </p>
                    <p className="text-[10px] uppercase tracking-tighter opacity-50">Available on Sepolia</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};