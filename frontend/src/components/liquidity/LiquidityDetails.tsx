import { AlertTriangle } from "lucide-react";

interface LiquidityDetailsProps {
  slippageTolerance: string;
  onSlippageChange: (value: string) => void;
  ethAmount: string;
  tokenAmount: string;
  poolShare: string;
  liquidityMode: "add" | "remove";
  poolExists: boolean;
}

export function LiquidityDetails({
  slippageTolerance,
  onSlippageChange,
  ethAmount,
  tokenAmount,
  poolShare,
  liquidityMode,
  poolExists,
}: LiquidityDetailsProps) {
  return (
    <div className="mb-4 p-4 bg-[#1A1A25]/30 rounded-xl border border-white/5">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Slippage Tolerance</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={slippageTolerance}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  onSlippageChange(val);
                }
              }}
              className="w-16 bg-[#2B2B36] text-white text-right px-2 py-1 rounded outline-none focus:border-purple-neon/50 border border-white/10"
            />
            <span className="text-slate-400">%</span>
          </div>
        </div>

        {liquidityMode === "add" && poolExists && ethAmount && tokenAmount && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Pool Share</span>
              <span className="text-purple-300 font-mono">{poolShare}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Rate</span>
              <span className="text-white font-mono">
                1 ETH = {(parseFloat(tokenAmount) / parseFloat(ethAmount)).toFixed(6)}{" "}
                tokens
              </span>
            </div>
          </>
        )}

        {!poolExists && liquidityMode === "add" && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-purple-neon/10 rounded-lg border border-purple-neon/20">
            <AlertTriangle className="w-4 h-4 text-purple-neon flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300">
              This will create a new pool for this token.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
