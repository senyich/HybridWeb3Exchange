interface LiquidityButtonProps {
  isConnected: boolean;
  isValidInput: boolean;
  isInsufficientEthBalance: boolean;
  isInsufficientTokenBalance: boolean;
  isInsufficientLiquidity: boolean;
  isTxConfirming: boolean;
  isLiquidityPending: boolean;
  isApprovePending: boolean;
  needsApproval: boolean;
  liquidityMode: "add" | "remove";
  tokenSymbol: string;
  onApprove: () => void;
  onLiquidity: () => void;
}

export function LiquidityButton({
  isConnected,
  isValidInput,
  isInsufficientEthBalance,
  isInsufficientTokenBalance,
  isInsufficientLiquidity,
  isTxConfirming,
  isLiquidityPending,
  isApprovePending,
  needsApproval,
  liquidityMode,
  tokenSymbol,
  onApprove,
  onLiquidity,
}: LiquidityButtonProps) {
  if (!isConnected) {
    return (
      <button
        disabled
        className="w-full py-4 bg-white/5 text-slate-400 font-bold uppercase tracking-wider rounded-xl cursor-not-allowed"
      >
        Connect Wallet
      </button>
    );
  }

  if (isTxConfirming) {
    return (
      <button
        disabled
        className="w-full py-4 bg-purple-neon/20 text-purple-300 font-bold uppercase tracking-wider rounded-xl cursor-wait flex items-center justify-center gap-2"
      >
        <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
        Confirming...
      </button>
    );
  }

  if (isLiquidityPending || isApprovePending) {
    return (
      <button
        disabled
        className="w-full py-4 bg-purple-neon/20 text-purple-300 font-bold uppercase tracking-wider rounded-xl cursor-wait flex items-center justify-center gap-2"
      >
        <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
        {isApprovePending ? "Approving..." : "Confirm in Wallet..."}
      </button>
    );
  }

  if (!isValidInput) {
    return (
      <button
        disabled
        className="w-full py-4 bg-white/5 text-slate-400 font-bold uppercase tracking-wider rounded-xl cursor-not-allowed"
      >
        Enter Amount
      </button>
    );
  }

  if (liquidityMode === "add" && isInsufficientEthBalance) {
    return (
      <button
        disabled
        className="w-full py-4 bg-crimson-neon/10 text-crimson-neon font-bold uppercase tracking-wider rounded-xl cursor-not-allowed"
      >
        Insufficient ETH
      </button>
    );
  }

  if (liquidityMode === "add" && isInsufficientTokenBalance) {
    return (
      <button
        disabled
        className="w-full py-4 bg-crimson-neon/10 text-crimson-neon font-bold uppercase tracking-wider rounded-xl cursor-not-allowed"
      >
        Insufficient {tokenSymbol}
      </button>
    );
  }

  if (liquidityMode === "remove" && isInsufficientLiquidity) {
    return (
      <button
        disabled
        className="w-full py-4 bg-crimson-neon/10 text-crimson-neon font-bold uppercase tracking-wider rounded-xl cursor-not-allowed"
      >
        Insufficient Liquidity
      </button>
    );
  }

  if (needsApproval) {
    return (
      <button
        onClick={onApprove}
        className="w-full py-4 bg-purple-neon hover:bg-purple-neon/90 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-neon/20 hover:shadow-purple-neon/40 active:scale-[0.98]"
      >
        Approve {tokenSymbol}
      </button>
    );
  }

  return (
    <button
      onClick={onLiquidity}
      className={`w-full py-4 font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.98] ${
        liquidityMode === "add"
          ? "bg-purple-neon hover:bg-purple-neon/90 text-white shadow-purple-neon/20 hover:shadow-purple-neon/40"
          : "bg-crimson-neon hover:bg-crimson-neon/90 text-white shadow-crimson-neon/20 hover:shadow-crimson-neon/40"
      }`}
    >
      {liquidityMode === "add" ? "Add Liquidity" : "Remove Liquidity"}
    </button>
  );
}
