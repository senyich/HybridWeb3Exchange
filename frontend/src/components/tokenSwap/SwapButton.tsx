import { Zap, Loader2 } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import type { SwapMode } from "../../config/types";

interface SwapButtonProps {
  isConnected: boolean;
  isInputValid: boolean;
  isInsufficientBalance: boolean;
  isInsufficientLiquidity: boolean;
  isTxConfirming: boolean;
  isSwapPending: boolean;
  isApprovePending: boolean;
  needsApproval: boolean;
  swapMode: SwapMode;
  tokenSymbol?: string;
  onApprove: () => void;
  onSwap: () => void;
}

export function SwapButton({
  isConnected,
  isInputValid,
  isInsufficientBalance,
  isInsufficientLiquidity,
  isTxConfirming,
  isSwapPending,
  isApprovePending,
  needsApproval,
  swapMode,
  tokenSymbol = "TOKEN",
  onApprove,
  onSwap,
}: SwapButtonProps) {
  if (!isConnected) {
    return (
      <div className="w-full mt-2 [&>button]:w-full [&>button]:py-4 [&>button]:text-lg [&>button]:font-bold [&>button]:bg-gradient-to-r [&>button]:from-purple-deep [&>button]:to-purple-900 [&>button]:rounded-xl [&>button]:shadow-neon-purple [&>button]:transition-all hover:[&>button]:scale-[1.02]">
        <ConnectKitButton />
      </div>
    );
  }

  if (isInputValid && isInsufficientBalance) {
    return (
      <button
        disabled
        className="w-full mt-2 bg-crimson-dark/50 border border-crimson-blood/50 text-crimson-neon font-bold py-4 rounded-xl cursor-not-allowed transition-all uppercase tracking-wide"
      >
        Insufficient {swapMode === "ethToToken" ? "ETH" : tokenSymbol} Balance
      </button>
    );
  }

  if (isInputValid && isInsufficientLiquidity) {
    return (
      <button
        disabled
        className="w-full mt-2 bg-surface border border-white/5 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed transition-all uppercase tracking-wide"
      >
        Insufficient Liquidity
      </button>
    );
  }

  if (isTxConfirming || isSwapPending || isApprovePending) {
    return (
      <button
        disabled
        className="w-full mt-2 bg-purple-deep/40 border border-purple-neon/20 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-3 cursor-wait"
      >
        <Loader2 className="w-5 h-5 animate-spin text-purple-neon" />
        <span className="animate-pulse">Processing Transaction...</span>
      </button>
    );
  }

  if (needsApproval) {
    return (
      <button
        onClick={onApprove}
        className="w-full mt-2 bg-gradient-to-r from-purple-electric to-purple-neon hover:from-purple-neon hover:to-purple-electric text-white font-bold py-4 rounded-xl transition-all shadow-neon-purple flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Zap className="w-5 h-5 fill-current" />
        Approve {tokenSymbol}
      </button>
    );
  }

  return (
    <button
      onClick={onSwap}
      disabled={!isInputValid}
      className="w-full mt-2 relative overflow-hidden group bg-gradient-to-r from-purple-neon via-purple-electric to-crimson-neon hover:shadow-neon-purple disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2"
    >
      <div className="absolute inset-0 w-full h-full bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
      <Zap className="w-5 h-5 fill-current relative z-10" />
      <span className="relative z-10 text-lg tracking-wide">Swap Now</span>
    </button>
  );
}