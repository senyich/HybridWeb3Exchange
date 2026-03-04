import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";

interface TransactionStatusProps {
  txHash: string | null;
  isTxConfirming: boolean;
  isTxSuccess: boolean;
  liquidityError: Error | null;
}

export function TransactionStatus({
  txHash,
  isTxConfirming,
  isTxSuccess,
  liquidityError,
}: TransactionStatusProps) {
  if (!txHash && !isTxConfirming && !isTxSuccess && !liquidityError) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-[#1A1A25]/30 rounded-xl border border-white/5">
      {isTxConfirming && (
        <div className="flex items-center gap-3 text-yellow-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Confirming transaction...</span>
        </div>
      )}

      {isTxSuccess && (
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Transaction successful!</span>
          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs hover:underline"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {liquidityError && (
        <div className="flex items-center gap-3 text-crimson-neon">
          <XCircle className="w-5 h-5" />
          <div>
            <span className="text-sm font-medium block">Transaction failed</span>
            <span className="text-xs opacity-75">{liquidityError.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
