/* eslint-disable @typescript-eslint/no-explicit-any */
import { Zap, Loader2, AlertCircle } from "lucide-react";

interface TransactionStatusProps {
  txHash: string | null;
  isTxConfirming: boolean;
  isTxSuccess: boolean;
  swapError: any;
}

export function TransactionStatus({
  txHash,
  isTxConfirming,
  isTxSuccess,
  swapError,
}: TransactionStatusProps) {
  return (
    <>
      {txHash && (
        <div className="mb-4 p-4 bg-purple-deep/20 border border-purple-neon/30 rounded-2xl flex items-start gap-4 animate-slide-up shadow-[0_0_20px_rgba(176,38,255,0.1)_inset]">
          <div className="mt-1 p-1.5 bg-purple-neon/20 rounded-full">
            {isTxConfirming ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-neon" />
            ) : (
              <Zap className="w-4 h-4 text-green-400" />
            )}
          </div>
          <div className="flex flex-col w-full min-w-0">
            <span className="text-sm font-bold text-white mb-0.5">
              {isTxConfirming
                ? "Transaction Processing..."
                : isTxSuccess
                ? "Swap Successful!"
                : "Transaction Submitted"}
            </span>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-300/70 hover:text-white hover:underline transition-colors truncate"
            >
              View on Explorer ↗
            </a>
          </div>
        </div>
      )}

      {swapError && (
        <div className="mb-4 p-4 bg-crimson-dark/20 border border-crimson-neon/30 rounded-2xl flex items-center gap-4 animate-slide-up">
          <div className="p-1.5 bg-crimson-neon/10 rounded-full shrink-0">
            <AlertCircle className="w-5 h-5 text-crimson-neon" />
          </div>
          <span className="text-xs text-crimson-neon/90 font-medium break-words w-full">
            {swapError.shortMessage || swapError.message || "Transaction failed"}
          </span>
        </div>
      )}
    </>
  );
}