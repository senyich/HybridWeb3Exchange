import { EthPriceTicker } from "../components/EthPriceTicker";
import { TokenSwap } from "../components/TokenSwap";

export default function SwapPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center pt-24 pb-12 px-4 sm:px-6">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-neon/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-crimson-neon/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-[480px] flex flex-col gap-6 animate-fade-in">
        <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Swap
          </h1>
          <EthPriceTicker />
        </div>
        <TokenSwap />
      </div>
    </div>
  );
}
