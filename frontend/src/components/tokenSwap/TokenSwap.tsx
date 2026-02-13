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
import { EXCHANGE_CONTRACT_ADDRESS } from "../../config/constants";
import { getSymbolsAsync } from "../../utils/api";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../../config/contractsAbis";
import type { Token } from "../../config/types";
import { SwapInputPanel } from "./SwapInputPanel";
import { SwapButton } from "./SwapButton";
import { SwapDetails } from "./SwapDetails";
import { TransactionStatus } from "./TransactionStatus";
import { TokenSelector } from "./TokenSelector";
import { getAmountOut } from "../../utils/swapMath";
import { ArrowDownUp, Settings2 } from "lucide-react";

type SwapMode = "ethToToken" | "tokenToEth";

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
    [selectedTokenAddress, supportedTokens],
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

  const displayInputBalance =
    swapMode === "ethToToken"
      ? ethBalance
        ? formatEther(ethBalance.value)
        : "0"
      : tokenBalance
        ? formatUnits(tokenBalance as bigint, decimals)
        : "0";

  const displayOutputBalance =
    swapMode === "tokenToEth"
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
      },
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
        },
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
        },
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
          <SwapInputPanel
            label="You pay"
            amount={inputAmount}
            onAmountChange={setInputAmount}
            displayBalance={displayInputBalance}
            isBalanceLoading={isBalanceLoading}
            isConnected={isConnected}
            isTxConfirming={isTxConfirming}
            onMaxClick={handleMaxInput}
            isInsufficientBalance={isInsufficientBalance}
            tokenSelector={
              <TokenSelector
                isEth={swapMode === "ethToToken"}
                selected={selectedTokenAddress}
                onSelect={(val) =>
                  setSelectedTokenAddress(val as `0x${string}`)
                }
                supportedTokens={supportedTokens}
                isLoadingTokens={isLoadingTokens}
              />
            }
            swapMode={swapMode}
          />

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

          <SwapInputPanel
            label="You receive"
            amount={inputAmount ? displayOutput : "0"}
            displayBalance={displayOutputBalance}
            isBalanceLoading={isBalanceLoading}
            isConnected={isConnected}
            isTxConfirming={isTxConfirming}
            isReadOnly={true}
            tokenSelector={
              <TokenSelector
                isEth={swapMode === "tokenToEth"}
                selected={selectedTokenAddress}
                onSelect={(val) =>
                  setSelectedTokenAddress(val as `0x${string}`)
                }
                supportedTokens={supportedTokens}
                isLoadingTokens={isLoadingTokens}
                disabled={false}
              />
            }
            swapMode={swapMode === "ethToToken" ? "tokenToEth" : "ethToToken"}
            isOutput={true}
          />
        </div>

        <div className="p-4 pt-2">
          {inputAmount && (
            <SwapDetails
              slippageTolerance={slippageTolerance}
              onSlippageChange={setSlippageTolerance}
            />
          )}

          <TransactionStatus
            txHash={txHash}
            isTxConfirming={isTxConfirming}
            isTxSuccess={isTxSuccess}
            swapError={swapError}
          />

          <SwapButton
            isConnected={isConnected}
            isInputValid={isInputValid}
            isInsufficientBalance={isInsufficientBalance}
            isInsufficientLiquidity={isInsufficientLiquidity}
            isTxConfirming={isTxConfirming}
            isSwapPending={isSwapPending}
            isApprovePending={isApprovePending}
            needsApproval={needsApproval}
            swapMode={swapMode}
            tokenSymbol={tokenConfig?.symbol}
            onApprove={handleApprove}
            onSwap={handleSwap}
          />
        </div>
      </div>
    </div>
  );
}
