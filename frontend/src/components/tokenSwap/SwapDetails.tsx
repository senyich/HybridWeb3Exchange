import { Zap } from "lucide-react";

interface SwapDetailsProps {
  slippageTolerance: string;
  onSlippageChange: (value: string) => void;
}

export function SwapDetails({ slippageTolerance, onSlippageChange }: SwapDetailsProps) {
  return (
    <div className="mx-2 mb-4 p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 animate-fade-in">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Slippage Tolerance</span>
        <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md border border-white/5 focus-within:border-purple-neon/50 transition-colors">
          <input
            className="bg-transparent text-right w-8 text-white font-mono outline-none"
            value={slippageTolerance}
            onChange={(e) => onSlippageChange(e.target.value)}
          />
          <span className="text-purple-electric font-bold">%</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Network Fee</span>
        <span className="text-slate-200 font-mono">
          <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
          ~0.3%
        </span>
      </div>
    </div>
  );
}