import { useAccount } from "wagmi";
import { Droplets } from "lucide-react";
import { EthPriceTicker } from "../components/EthPriceTicker";
import { LiquidityManager } from "../components/liquidity/LiquidityManager";

export default function LiquidityPage() {
  const { isConnected } = useAccount();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center pt-24 pb-12 px-4 sm:px-6">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-neon/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-crimson-neon/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-[480px] flex flex-col gap-6 animate-fade-in">
        <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Liquidity
          </h1>
          <EthPriceTicker />
        </div>

        {isConnected ? (
          <LiquidityManager />
        ) : (
          <div className="bg-[#0D0D12]/90 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl shadow-black p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-neon to-purple-deep flex items-center justify-center border-2 border-white/20">
                <Droplets className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-slate-400 text-sm">
                Connect your wallet to manage liquidity pools
              </p>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
