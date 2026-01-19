/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef } from "react";
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
  ChevronDown,
  Search,
} from "lucide-react";
import { EXCHANGE_CONTRACT_ADDRESS } from "../config/constants";
import { getSymbolsAsync } from "../utils/api";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";
import { ConnectKitButton } from "connectkit";
import { Skeleton } from "./Skeleton";
import type { Token } from "../config/types";

type SwapMode = "ethToToken" | "tokenToEth";


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
          Insufficient {swapMode === "ethToToken" ? "ETH" : tokenConfig?.symbol}{" "}
          Balance
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
          onClick={handleApprove}
          className="w-full mt-2 bg-gradient-to-r from-purple-electric to-purple-neon hover:from-purple-neon hover:to-purple-electric text-white font-bold py-4 rounded-xl transition-all shadow-neon-purple flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
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
        className="w-full mt-2 relative overflow-hidden group bg-gradient-to-r from-purple-neon via-purple-electric to-crimson-neon hover:shadow-neon-purple disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2"
      >
        <div className="absolute inset-0 w-full h-full bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
        <Zap className="w-5 h-5 fill-current relative z-10" />
        <span className="relative z-10 text-lg tracking-wide">Swap Now</span>
      </button>
    );
  };

const TokenSelector = ({
  isEth,
  selected,
  onSelect,
  disabled = false,
}: {
  isEth: boolean;
  selected: string;
  onSelect: (val: string) => void;
  disabled?: boolean;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setLocalSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedToken = useMemo(
    () => supportedTokens.find((t) => t.address === selected),
    [selected, supportedTokens]
  );

  const filteredTokens = useMemo(() => {
    if (!localSearchQuery) return supportedTokens;
    return supportedTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
  }, [supportedTokens, localSearchQuery]);

  const handleTokenSelect = (tokenAddress: string) => {
    onSelect(tokenAddress);
    setIsDropdownOpen(false);
    setLocalSearchQuery("");
  };

  if (isEth) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 pl-3 pr-4 py-2.5 rounded-2xl shadow-glass shadow-lg cursor-default">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center border-2 border-white/30">
            <span className="text-xs font-black text-white">Ξ</span>
          </div>
          <div className="absolute -inset-1 rounded-full bg-cyan-500/20 blur-md -z-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white tracking-tight">
            ETH
          </span>
          <span className="text-xs text-slate-400">Ethereum</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsDropdownOpen(true)}
        disabled={disabled}
        className={`flex items-center gap-3 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 pl-3 pr-4 py-2.5 rounded-2xl shadow-glass shadow-lg transition-all duration-300 group min-w-[180px] ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-neon-purple/20 cursor-pointer"
        }`}
      >
        {isLoadingTokens ? (
          <Loader2 className="w-5 h-5 animate-spin text-purple-electric mx-2" />
        ) : (
          <>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-neon to-purple-deep flex items-center justify-center border-2 border-white/30">
                <span className="text-xs font-bold text-white">
                  {selectedToken?.symbol?.[0] || "T"}
                </span>
              </div>
              <div className="absolute -inset-1 rounded-full bg-purple-neon/20 blur-md -z-10" />
            </div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-lg font-bold text-white tracking-tight truncate w-full">
                {selectedToken?.symbol || "SELECT"}
              </span>
              <span className="text-xs text-slate-400 truncate w-full">
                {selectedToken?.name || "Select Token"}
              </span>
            </div>
            {!disabled && (
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </>
        )}
      </button>

      {isDropdownOpen && !isLoadingTokens && !disabled && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-gradient-to-b from-surface/95 to-surface/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search token..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-neon/50 transition-colors"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleTokenSelect(token.address)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-neon/50 to-purple-deep/50 flex items-center justify-center border border-white/20">
                    <span className="text-xs font-bold text-white">
                      {token.symbol[0]}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-white group-hover:text-purple-electric transition-colors">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {token.name}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

  return (
    <div className="w-full flex justify-center items-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] bg-purple-neon/20 blur-[100px] rounded-full pointer-events-none z-0 animate-pulse-slow" />

      <div className="w-full max-w-[480px] relative z-10 backdrop-blur-2xl bg-[#0D0D12]/90 rounded-[32px] border border-white/10 shadow-2xl shadow-black overflow-hidden ring-1 ring-white/5">
        
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Swap
            </h2>
          </div>
          <button className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all group">
            <Settings2 className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        <div className="p-2 space-y-1">
          <div className="bg-[#13131A] hover:bg-[#16161E] border border-transparent hover:border-purple-neon/20 rounded-[24px] p-4 transition-all duration-300 group focus-within:ring-1 focus-within:ring-purple-neon/50 relative">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-slate-400 font-medium pl-1">
                You pay
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
                {isConnected && (
                  <button
                    onClick={handleMaxInput}
                    className="text-[10px] font-bold text-purple-electric hover:text-white bg-purple-electric/10 hover:bg-purple-electric px-1.5 rounded uppercase tracking-wider transition-all"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-[40px] leading-none font-medium text-white placeholder-white/10 outline-none font-sans"
                disabled={!isConnected || isTxConfirming}
              />
              <TokenSelector
                isEth={swapMode === "ethToToken"}
                selected={selectedTokenAddress}
                onSelect={(val) =>
                  setSelectedTokenAddress(val as `0x${string}`)
                }
              />
            </div>
            <div className="mt-1 h-5 pl-1">
                <span className="text-xs text-slate-500 font-medium">
                    {inputAmount && !isNaN(parseFloat(inputAmount)) 
                        ? `≈ $${(parseFloat(inputAmount) * (swapMode === 'ethToToken' ? 2400 : 15)).toLocaleString()}` 
                        : null}
                </span>
            </div>
          </div>

          <div className="relative h-1 z-20">
            <div className="absolute left-1/2 -translate-x-1/2 -top-[18px]">
              <button
                onClick={handleSwitchMode}
                className="group p-2 rounded-xl bg-[#0D0D12] border-[4px] border-[#0D0D12] shadow-xl hover:shadow-neon-purple/20 transition-all active:scale-95"
              >
                <div className="bg-[#2B2B36] group-hover:bg-purple-deep p-2 rounded-lg transition-colors">
                  <ArrowDownUp className="w-4 h-4 text-purple-electric group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>
          </div>

          <div className="bg-[#13131A] hover:bg-[#16161E] border border-transparent hover:border-purple-neon/20 rounded-[24px] p-4 transition-all duration-300">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-slate-400 font-medium pl-1">
                You receive
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="text"
                readOnly
                value={inputAmount ? formatDisplay(displayOutput) : "0"}
                className={`w-full bg-transparent text-[40px] leading-none font-medium outline-none cursor-default font-sans transition-colors ${
                  !inputAmount || parseFloat(displayOutput) === 0
                    ? "text-slate-600"
                    : "text-purple-neon drop-shadow-[0_0_8px_rgba(176,38,255,0.3)]"
                }`}
              />
              <TokenSelector
                isEth={swapMode === "tokenToEth"}
                selected={selectedTokenAddress}
                onSelect={(val) =>
                  setSelectedTokenAddress(val as `0x${string}`)
                }
              />
            </div>

             <div className="mt-1 h-5 pl-1 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                    {inputAmount ? "Best price via V2" : ""}
                </span>
            </div>
          </div>
        </div>

        <div className="p-4 pt-2">
          {inputAmount && (
            <div className="mx-2 mb-4 p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Slippage Tolerance</span>
                <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md border border-white/5 focus-within:border-purple-neon/50 transition-colors">
                  <input
                    className="bg-transparent text-right w-8 text-white font-mono outline-none"
                    value={slippageTolerance}
                    onChange={(e) => setSlippageTolerance(e.target.value)}
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
          )}

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
                {(swapError as any).shortMessage ||
                  swapError.message ||
                  "Transaction failed"}
              </span>
            </div>
          )}

          {renderActionButton()}
        </div>
      </div>
    </div>
  );
}