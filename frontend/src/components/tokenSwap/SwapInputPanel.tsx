import { Wallet } from "lucide-react";
import { Skeleton } from "../Skeleton";
import type { SwapMode } from "../../config/types";

interface SwapInputPanelProps {
  label: string;
  amount: string;
  onAmountChange?: (value: string) => void;
  displayBalance: string;
  isBalanceLoading: boolean;
  isConnected: boolean;
  isTxConfirming: boolean;
  onMaxClick?: () => void;
  isInsufficientBalance?: boolean;
  tokenSelector: React.ReactNode;
  swapMode: SwapMode;
  isReadOnly?: boolean;
  isOutput?: boolean;
}

export function SwapInputPanel({
  label,
  amount,
  onAmountChange,
  displayBalance,
  isBalanceLoading,
  isConnected,
  isTxConfirming,
  onMaxClick,
  isInsufficientBalance,
  tokenSelector,
  swapMode,
  isReadOnly = false,
  isOutput = false,
}: SwapInputPanelProps) {
  const formatDisplay = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0.00";
    if (num > 0 && num < 0.000001) return "< 0.000001";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="bg-[#13131A] hover:bg-[#16161E] border border-transparent hover:border-purple-neon/20 rounded-[24px] p-4 transition-all duration-300 group focus-within:ring-1 focus-within:ring-purple-neon/50 relative">
      <div className="flex justify-between mb-3">
        <span className="text-sm text-slate-400 font-medium pl-1">
          {label}
        </span>
        <div
          className={`flex items-center gap-2 text-sm px-2 py-0.5 rounded-md transition-colors ${
            isInsufficientBalance
              ? "bg-crimson-dark/30 text-crimson-neon"
              : "bg-black/20 text-slate-400"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          {isBalanceLoading ? (
            <Skeleton className="w-16 h-3 bg-white/10" />
          ) : (
            <span className="font-mono font-medium">
              {formatDisplay(displayBalance)}
            </span>
          )}
          {isConnected && onMaxClick && !isOutput && (
            <button
              onClick={onMaxClick}
              className="text-[10px] font-bold text-purple-electric hover:text-white bg-purple-electric/10 hover:bg-purple-electric px-1.5 rounded uppercase tracking-wider transition-all"
            >
              Max
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type={isReadOnly ? "text" : "number"}
          value={isReadOnly ? formatDisplay(amount) : amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          placeholder="0"
          readOnly={isReadOnly}
          className={`w-full bg-transparent text-[40px] leading-none font-medium outline-none font-sans ${
            isReadOnly
              ? amount === "0" || !amount
                ? "text-slate-600 cursor-default"
                : "text-purple-neon drop-shadow-[0_0_8px_rgba(176,38,255,0.3)] cursor-default"
              : "text-white placeholder-white/10"
          }`}
          disabled={!isConnected || isTxConfirming}
        />
        {tokenSelector}
      </div>
      <div className="mt-1 h-5 pl-1">
        {amount && !isNaN(parseFloat(amount)) && !isOutput && (
          <span className="text-xs text-slate-500 font-medium">
            ≈ ${(parseFloat(amount) * (swapMode === "ethToToken" ? 2400 : 15)).toLocaleString()}
          </span>
        )}
        {isOutput && amount !== "0" && (
          <span className="text-xs text-slate-500 font-medium">
            Best price via V2
          </span>
        )}
      </div>
    </div>
  );
}