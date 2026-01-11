import { EthPriceTicker } from "../components/EthPriceTicker";
import { TokenSwap } from "../components/TokenSwap";

export default function SwapPage() {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <EthPriceTicker />
        </div>
        <div className="rounded-2xl bg-surface/50 backdrop-blur-lg border border-purple-dark/40 shadow-glass p-8">
          <TokenSwap />
        </div>
      </div>
    </div>
  );
}
