/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  useBlockNumber,
} from "wagmi";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { ArrowDownUp, Zap, AlertCircle, Loader2, Wallet } from "lucide-react";
import {
  EXCHANGE_CONTRACT_ADDRESS,
  SUPPORTED_TOKENS,
} from "../config/constants";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";
import { Card } from "./Card";
import { ConnectKitButton } from "connectkit";
import { Skeleton } from "./Skeleton";

type SwapMode = "ethToToken" | "tokenToEth";

function getAmountOut(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint {
  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;
  const amountInWithFee = amountIn * 997n; // 0.3% fee
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  return numerator / denominator;
}

// Helper for nice formatting (e.g. 0.1000 -> 0.1)
const formatDisplay = (val: string) => {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
};

export function TokenSwap() {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const [swapMode, setSwapMode] = useState<SwapMode>("ethToToken");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    `0x${string}`
  >(SUPPORTED_TOKENS[0].address);
  const [slippageTolerance, setSlippageTolerance] = useState<string>("0.5");
  const [txHash, setTxHash] = useState<string | null>(null);

  const tokenConfig = useMemo(
    () =>
      SUPPORTED_TOKENS.find((t) => t.address === selectedTokenAddress) ||
      SUPPORTED_TOKENS[0],
    [selectedTokenAddress]
  );

  const {
    data: ethBalance,
    refetch: refetchEth,
    isLoading: isEthLoading,
  } = useBalance({ address });

  const { data: tokenDecimals } = useReadContract({
    address: selectedTokenAddress,
    abi: ERC20_MIN_ABI,
    functionName: "decimals",
  });
  const decimals = tokenDecimals ? Number(tokenDecimals) : 18;

  const {
    data: tokenBalance,
    refetch: refetchToken,
    isLoading: isTokenLoading,
  } = useReadContract({
    address: selectedTokenAddress,
    abi: ERC20_MIN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "getReserves",
    args: [selectedTokenAddress],
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedTokenAddress,
    abi: ERC20_MIN_ABI,
    functionName: "allowance",
    args: address ? [address, EXCHANGE_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address && swapMode === "tokenToEth",
    },
  });

  useEffect(() => {
    if (!isConnected) return;
    refetchEth();
    refetchToken();
    refetchReserves();
    if (swapMode === "tokenToEth") refetchAllowance();
  }, [
    blockNumber,
    isConnected,
    swapMode,
    refetchEth,
    refetchToken,
    refetchReserves,
    refetchAllowance,
  ]);

  const {
    writeContract: writeSwap,
    isPending: isSwapPending,
    error: swapError,
  } = useWriteContract();

  const { writeContract: writeApprove, isPending: isApprovePending } =
    useWriteContract();

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}` | undefined,
    });

  useEffect(() => {
    if (isTxSuccess) {
      setInputAmount("");
      setTxHash(null);
      refetchEth();
      refetchToken();
      refetchReserves();
      refetchAllowance();
    }
  }, [
    isTxSuccess,
    refetchEth,
    refetchToken,
    refetchReserves,
    refetchAllowance,
  ]);

  const parsedInputAmount = useMemo(() => {
    if (!inputAmount || isNaN(Number(inputAmount))) return 0n;
    try {
      return swapMode === "ethToToken"
        ? parseEther(inputAmount)
        : parseUnits(inputAmount, decimals);
    } catch {
      return 0n;
    }
  }, [inputAmount, swapMode, decimals]);

  const ethReserve = reserves ? reserves[0] : 0n;
  const tokenReserve = reserves ? reserves[1] : 0n;

  const [inputReserve, outputReserve] =
    swapMode === "ethToToken"
      ? [ethReserve, tokenReserve]
      : [tokenReserve, ethReserve];

  const calculatedOutputAmount = useMemo(() => {
    return getAmountOut(parsedInputAmount, inputReserve, outputReserve);
  }, [parsedInputAmount, inputReserve, outputReserve]);

  const minOutputAmount = useMemo(() => {
    const slip = parseFloat(slippageTolerance) || 0.5;
    const slipFactor = 10000 - Math.floor(slip * 100);
    return (calculatedOutputAmount * BigInt(slipFactor)) / 10000n;
  }, [calculatedOutputAmount, slippageTolerance]);

  const displayBalance =
    swapMode === "ethToToken"
      ? ethBalance
        ? formatEther(ethBalance.value)
        : "0"
      : tokenBalance
      ? formatUnits(tokenBalance as bigint, decimals)
      : "0";

  const isBalanceLoading =
    swapMode === "ethToToken" ? isEthLoading : isTokenLoading;

  const displayOutput =
    calculatedOutputAmount > 0n
      ? swapMode === "ethToToken"
        ? formatUnits(calculatedOutputAmount, decimals)
        : formatEther(calculatedOutputAmount)
      : "0";

  const isInsufficientLiquidity =
    inputReserve <= 0n || (outputReserve <= 0n && parsedInputAmount > 0n);

  const isInsufficientBalance =
    swapMode === "ethToToken"
      ? (ethBalance?.value || 0n) < parsedInputAmount
      : (tokenBalance as bigint || 0n) < parsedInputAmount;

  const currentAllowanceBN = allowance ? (allowance as bigint) : 0n;

  const needsApproval =
    swapMode === "tokenToEth" &&
    parsedInputAmount > 0n &&
    currentAllowanceBN < parsedInputAmount;

  const isInputValid = parsedInputAmount > 0n;

  const handleApprove = () => {
    writeApprove(
      {
        address: selectedTokenAddress,
        abi: ERC20_MIN_ABI,
        functionName: "approve",
        args: [EXCHANGE_CONTRACT_ADDRESS, parsedInputAmount],
      },
      {
        onError: (err) => console.error("Approve failed", err),
      }
    );
  };

  const handleSwap = () => {
    if (!isInputValid || isInsufficientBalance) return;

    if (swapMode === "ethToToken") {
      writeSwap(
        {
          address: EXCHANGE_CONTRACT_ADDRESS,
          abi: EXCHANGE_BASE_ABI,
          functionName: "swapExactETHForTokens",
          args: [selectedTokenAddress, minOutputAmount],
          value: parsedInputAmount,
        },
        {
          onSuccess: (hash) => setTxHash(hash),
          onError: (err) => console.error("Swap ETH->Token failed", err),
        }
      );
    } else {
      writeSwap(
        {
          address: EXCHANGE_CONTRACT_ADDRESS,
          abi: EXCHANGE_BASE_ABI,
          functionName: "swapExactTokensForETH",
          args: [selectedTokenAddress, parsedInputAmount, minOutputAmount],
        },
        {
          onSuccess: (hash) => setTxHash(hash),
          onError: (err) => console.error("Swap Token->ETH failed", err),
        }
      );
    }
  };

  const renderActionButton = () => {
    if (!isConnected) {
      return (
        <div className="w-full [&>button]:w-full [&>button]:py-4 [&>button]:text-lg [&>button]:font-bold [&>button]:bg-purple-600 hover:[&>button]:bg-purple-700">
          <ConnectKitButton />
        </div>
      );
    }

    if (isInputValid && isInsufficientBalance) {
      return (
        <button
          disabled
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed transition-all"
        >
          Insufficient Balance
        </button>
      );
    }

    if (isInputValid && isInsufficientLiquidity) {
      return (
        <button
          disabled
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed transition-all"
        >
          Insufficient Liquidity
        </button>
      );
    }

    if (isTxConfirming || isSwapPending || isApprovePending) {
      return (
        <button
          disabled
          className="w-full bg-purple-900/40 border border-purple-500/20 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-3 cursor-wait"
        >
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          Processing Transaction...
        </button>
      );
    }

    if (needsApproval) {
      return (
        <button
          onClick={handleApprove}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 flex justify-center items-center gap-2"
        >
          <Zap className="w-5 h-5 fill-current" />
          Approve {tokenConfig.symbol}
        </button>
      );
    }

    return (
      <button
        onClick={handleSwap}
        disabled={!isInputValid}
        className="w-full bg-gradient-to-r from-purple-600 to-crimson-neon hover:from-purple-500 hover:to-crimson-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
      >
        <Zap className="w-5 h-5 fill-current" />
        Swap Now
      </button>
    );
  };

  return (
    <Card className="w-full max-w-lg mx-auto relative !p-0 border-purple-500/10">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight">Exchange</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSwapMode(
                swapMode === "ethToToken" ? "tokenToEth" : "ethToToken"
              );
              setInputAmount("");
            }}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 transition-colors"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-2">
        {/* INPUT FIELD */}
        <div className="bg-background/50 border border-white/5 rounded-2xl p-4 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all hover:border-white/10">
          <div className="flex justify-between mb-3">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              You Pay
            </label>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Wallet className="w-3 h-3" />
              {isBalanceLoading ? (
                <Skeleton className="w-16 h-3" />
              ) : (
                <span
                  className="font-mono cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={() => setInputAmount(displayBalance)}
                >
                  {formatDisplay(displayBalance)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-4xl font-mono text-white outline-none placeholder-slate-700"
              disabled={!isConnected || isTxConfirming}
            />
            {swapMode === "ethToToken" ? (
              <div className="flex items-center gap-2 bg-slate-800/80 pl-2 pr-4 py-1.5 rounded-full border border-white/10">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold">
                  E
                </div>
                <span className="text-base font-bold text-slate-200">ETH</span>
              </div>
            ) : (
              <select
                value={selectedTokenAddress}
                onChange={(e) =>
                  setSelectedTokenAddress(e.target.value as `0x${string}`)
                }
                className="bg-slate-800 text-white text-base font-bold rounded-full px-4 py-2 border border-slate-600 focus:border-purple-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
              >
                {SUPPORTED_TOKENS.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* SWAP INDICATOR */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="p-1.5 rounded-xl bg-surface border border-white/10 shadow-lg">
            <ArrowDownUp className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        {/* OUTPUT FIELD */}
        <div className="bg-background/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
          <div className="flex justify-between mb-3">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              You Receive
            </label>
            <span className="text-xs text-slate-500 font-mono">(Estimate)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span
              className={`text-4xl font-mono truncate ${
                !inputAmount || parseFloat(displayOutput) === 0
                  ? "text-slate-700"
                  : "text-purple-300"
              }`}
            >
              {inputAmount ? formatDisplay(displayOutput) : "0.0"}
            </span>

            {swapMode === "ethToToken" ? (
              <select
                value={selectedTokenAddress}
                onChange={(e) =>
                  setSelectedTokenAddress(e.target.value as `0x${string}`)
                }
                className="bg-slate-800 text-white text-base font-bold rounded-full px-4 py-2 border border-slate-600 focus:border-purple-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
              >
                {SUPPORTED_TOKENS.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800/80 pl-2 pr-4 py-1.5 rounded-full border border-white/10">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold">
                  E
                </div>
                <span className="text-base font-bold text-slate-200">ETH</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILS & ALERTS */}
      <div className="px-6 pb-6">
        <div className="mb-6 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/40 rounded-lg p-3 border border-white/5 flex flex-col justify-between">
            <div className="text-slate-500 mb-1 font-medium">Slippage</div>
            <div className="flex items-center gap-1 group">
              <input
                type="number"
                value={slippageTolerance}
                onChange={(e) => setSlippageTolerance(e.target.value)}
                className="w-full bg-transparent text-white outline-none font-mono text-sm border-b border-transparent group-hover:border-slate-700 focus:!border-purple-500 transition-colors"
                step="0.1"
                min="0.1"
                max="10"
              />
              <span className="text-slate-400">%</span>
            </div>
          </div>
          <div className="bg-slate-900/40 rounded-lg p-3 border border-white/5 flex flex-col justify-between">
            <div className="text-slate-500 mb-1 font-medium">Network Fee</div>
            <div className="text-white font-mono text-sm">~0.3%</div>
          </div>
        </div>

        {txHash && (
          <div className="mb-4 p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
            <div className="mt-0.5">
              {isTxConfirming ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-green-400" />
              )}
            </div>
            <div className="flex flex-col gap-1 w-full min-w-0">
              <div className="text-sm font-semibold text-white">
                {isTxConfirming
                  ? "Confirming Transaction..."
                  : isTxSuccess
                  ? "Swap Completed!"
                  : "Transaction Submitted"}
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-300/70 hover:text-purple-300 underline truncate transition-colors"
              >
                View on Explorer
              </a>
            </div>
          </div>
        )}

        {swapError && (
          <div className="mb-4 p-4 bg-red-900/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm text-red-200 font-medium">
              {(swapError as any).shortMessage ||
                swapError.message ||
                "Transaction failed"}
            </span>
          </div>
        )}

        {renderActionButton()}
      </div>
    </Card>
  );
}