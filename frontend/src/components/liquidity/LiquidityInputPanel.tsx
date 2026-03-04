/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChangeEvent, ReactNode } from "react";

interface LiquidityInputPanelProps {
  label: string;
  amount: string;
  onAmountChange?: (value: string) => void;
  displayBalance: string;
  isBalanceLoading: boolean;
  isConnected: boolean;
  isTxConfirming: boolean;
  onMaxClick?: () => void;
  isInsufficientBalance?: boolean;
  tokenSelector: ReactNode;
  isReadOnly?: boolean;
}

export function LiquidityInputPanel({
  label,
  amount,
  onAmountChange,
  displayBalance,
  isBalanceLoading,
  isConnected,
  isTxConfirming,
  onMaxClick,
  isInsufficientBalance = false,
  tokenSelector,
  isReadOnly = false,
}: LiquidityInputPanelProps) {
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && onAmountChange) {
      onAmountChange(value);
    }
  };

  return (
    <div className="p-4 bg-[#1A1A25]/50 rounded-2xl border border-white/5 hover:border-purple-neon/20 transition-all group">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {isConnected && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Balance:</span>
            {isBalanceLoading ? (
              <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
            ) : (
              <span className="text-xs font-mono text-purple-300">
                {displayBalance}
              </span>
            )}
            {!isReadOnly && onMaxClick && (
              <button
                onClick={onMaxClick}
                className="px-2 py-0.5 text-xs font-bold text-purple-neon bg-purple-neon/10 rounded hover:bg-purple-neon/20 transition-colors"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            readOnly={isReadOnly || isTxConfirming}
            placeholder="0.00"
            disabled={!isConnected || isTxConfirming}
            className={`w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 outline-none disabled:opacity-50 ${
              isInsufficientBalance && amount ? "text-crimson-neon" : ""
            }`}
          />
          {isInsufficientBalance && amount && (
            <p className="text-xs text-crimson-neon mt-1">
              Insufficient balance
            </p>
          )}
        </div>
        <div className="flex-shrink-0">{tokenSelector}</div>
      </div>
    </div>
  );
}
