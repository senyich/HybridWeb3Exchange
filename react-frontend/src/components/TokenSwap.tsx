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
import {
  ArrowDownUp,
  Zap,
  AlertCircle,
  Loader2,
  Wallet,
  Settings2,
} from "lucide-react";
import { EXCHANGE_CONTRACT_ADDRESS } from "../config/constants";
import { getSymbolsAsync } from "../utils/api";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";
import { Card } from "./Card";
import { ConnectKitButton } from "connectkit";
import { Skeleton } from "./Skeleton";

type SwapMode = "ethToToken" | "tokenToEth";

interface Token {
  name: string;
  symbol: string;
  address: `0x${string}`;
}

function getAmountOut(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint {
  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;
  const amountInWithFee = amountIn * 997n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  return numerator / denominator;
}

const formatDisplay = (val: string) => {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.00";
  if (num > 0 && num < 0.000001) return "< 0.000001";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
};

export function TokenSwap() {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const tokens = await getSymbolsAsync();
        if (tokens && Array.isArray(tokens)) {
          setSupportedTokens(tokens as Token[]);
        }
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchTokens();
  }, []);

  const [swapMode, setSwapMode] = useState<SwapMode>("ethToToken");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [selectedTokenAddress, setSelectedTokenAddress] =
    useState<`0x${string}`>("0x0000000000000000000000000000000000000000");
  const [slippageTolerance, setSlippageTolerance] = useState<string>("0.5");
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (
      supportedTokens.length > 0 &&
      selectedTokenAddress === "0x0000000000000000000000000000000000000000"
    ) {
      const firstToken = supportedTokens[0];
      if (firstToken) {
        setSelectedTokenAddress(firstToken.address);
      }
    }
  }, [supportedTokens, selectedTokenAddress]);

  const tokenConfig = useMemo(
    () =>
      supportedTokens.find((t) => t.address === selectedTokenAddress) ||
      supportedTokens[0] || {
        name: "Token",
        symbol: "TOKEN",
        address: selectedTokenAddress,
      },
    [selectedTokenAddress, supportedTokens]
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
      : ((tokenBalance as bigint) || 0n) < parsedInputAmount;

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

  const handleMaxInput = () => {
    if (swapMode === "ethToToken" && ethBalance) {
      const value = ethBalance.value - parseEther("0.005");
      if (value > 0n) {
        setInputAmount(formatEther(value));
      } else {
        setInputAmount(formatEther(ethBalance.value));
      }
    } else if (swapMode === "tokenToEth" && tokenBalance) {
      setInputAmount(formatUnits(tokenBalance as bigint, decimals));
    }
  };

  const handleSwitchMode = () => {
    setSwapMode(swapMode === "ethToToken" ? "tokenToEth" : "ethToToken");
  };

  const renderActionButton = () => {
    if (!isConnected) {
      return (
        <div className="w-full [&>button]:w-full [&>button]:py-4 [&>button]:text-lg [&>button]:font-bold [&>button]:bg-purple-600 hover:[&>button]:bg-purple-700 [&>button]:rounded-xl">
          <ConnectKitButton />
        </div>
      );
    }

    if (isInputValid && isInsufficientBalance) {
      return (
        <button
          disabled
          className="w-full bg-slate-800 border border-slate-700 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed transition-all"
        >
          Insufficient {swapMode === "ethToToken" ? "ETH" : tokenConfig?.symbol}{" "}
          Balance
        </button>
      );
    }

    if (isInputValid && isInsufficientLiquidity) {
      return (
        <button
          disabled
          className="w-full bg-slate-800 border border-slate-700 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed transition-all"
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
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2"
        >
          <Zap className="w-5 h-5 fill-current" />
          Approve {tokenConfig?.symbol}
        </button>
      );
    }

    return (
      <button
        onClick={handleSwap}
        disabled={!isInputValid}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
      >
        <Zap className="w-5 h-5 fill-current" />
        Swap Now
      </button>
    );
  };

  const TokenSelector = ({
    isEth,
    selected,
    onSelect,
  }: {
    isEth: boolean;
    selected: string;
    onSelect: (val: string) => void;
  }) => {
    if (isEth) {
      return (
        <div className="flex items-center gap-2 bg-slate-800 pl-2 pr-4 py-1.5 rounded-full border border-white/10 shrink-0 h-10">
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
            E
          </div>
          <span className="text-base font-bold text-slate-200">ETH</span>
        </div>
      );
    }
    return (
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoadingTokens || supportedTokens.length === 0}
        className="h-10 bg-slate-800 text-white text-base font-bold rounded-full px-4 pr-8 border border-slate-600 focus:border-purple-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors shrink-0 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.7rem center",
          backgroundSize: "1em",
        }}
      >
        {isLoadingTokens ? (
          <option>Loading tokens...</option>
        ) : supportedTokens.length === 0 ? (
          <option>No tokens available</option>
        ) : (
          supportedTokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          ))
        )}
      </select>
    );
  };

  return (
    <Card className="w-full max-w-[480px] mx-auto relative !p-0 border-purple-500/10 shadow-2xl overflow-hidden bg-[#0D0D12]">
      <div className="px-6 py-5 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-neon via-purple-electric to-crimson-neon drop-shadow-[0_0_10px_rgba(176,38,255,0.3)]">
          Swap
        </h2>

        <div className="flex gap-2">
          <button className="group p-2 rounded-xl bg-white/5 hover:bg-purple-neon/20 border border-transparent hover:border-purple-neon/50 transition-all duration-300">
            <Settings2 className="w-10 h-8 text-purple-300 group-hover:text-white group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-1">
        <div className="bg-[#1B1B22] border border-transparent hover:border-white/5 rounded-2xl p-4 transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400 font-medium">You Send</span>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Wallet className="w-3.5 h-3.5" />
              {isBalanceLoading ? (
                <Skeleton className="w-16 h-3" />
              ) : (
                <span className="font-mono">
                  {formatDisplay(displayBalance)}
                </span>
              )}
              {isConnected && (
                <button
                  onClick={handleMaxInput}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase px-1.5 py-0.5 bg-purple-500/10 rounded transition-colors"
                >
                  Max
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-4xl font-medium text-white outline-none placeholder-slate-600"
              disabled={!isConnected || isTxConfirming}
            />
            <TokenSelector
              isEth={swapMode === "ethToToken"}
              selected={selectedTokenAddress}
              onSelect={(val) => setSelectedTokenAddress(val as `0x${string}`)}
            />
          </div>
        </div>

        <div className="relative h-2 z-10">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4">
            <button
              onClick={handleSwitchMode}
              className="p-2 rounded-xl bg-[#25252e] border-[3px] border-[#0D0D12] text-purple-400 hover:text-white hover:scale-110 hover:bg-purple-600 transition-all shadow-md"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-[#1B1B22] border border-transparent hover:border-white/5 rounded-2xl p-4 transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400 font-medium">
              You Receive
            </span>
            <span className="text-xs text-slate-500 font-mono">(Estimate)</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={inputAmount ? formatDisplay(displayOutput) : "0"}
              className={`w-full bg-transparent text-4xl font-medium outline-none cursor-default ${
                !inputAmount || parseFloat(displayOutput) === 0
                  ? "text-slate-600"
                  : "text-purple-300"
              }`}
            />
            <TokenSelector
              isEth={swapMode === "tokenToEth"}
              selected={selectedTokenAddress}
              onSelect={(val) => setSelectedTokenAddress(val as `0x${string}`)}
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {inputAmount && (
          <div className="mb-4 px-1 py-2 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Slippage Tolerance</span>
              <div className="flex items-center gap-1">
                <input
                  className="bg-transparent text-right w-8 text-slate-200 focus:text-purple-300 outline-none border-b border-white/10 focus:border-purple-500"
                  value={slippageTolerance}
                  onChange={(e) => setSlippageTolerance(e.target.value)}
                />
                <span>%</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Network Fee</span>
              <span className="text-slate-200">~0.3%</span>
            </div>
          </div>
        )}

        {txHash && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-start gap-3">
            <div className="mt-0.5">
              {isTxConfirming ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-green-400" />
              )}
            </div>
            <div className="flex flex-col w-full min-w-0">
              <span className="text-sm font-semibold text-white">
                {isTxConfirming
                  ? "Confirming..."
                  : isTxSuccess
                  ? "Swap Completed!"
                  : "Submitted"}
              </span>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-300/70 hover:text-purple-300 underline"
              >
                View on Etherscan (sepolia)
              </a>
            </div>
          </div>
        )}

        {swapError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-xs text-red-200 font-medium break-words w-full">
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
