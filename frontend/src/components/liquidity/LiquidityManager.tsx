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
import { LiquidityInputPanel } from "./LiquidityInputPanel";
import { LiquidityButton } from "./LiquidityButton";
import { TransactionStatus } from "./TransactionStatus";
import { TokenSelector } from "./TokenSelector";
import { LiquidityDetails } from "./LiquidityDetails";
import { Droplets, Settings2 } from "lucide-react";

type LiquidityMode = "add" | "remove";

export function LiquidityManager() {
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

  const [liquidityMode, setLiquidityMode] = useState<LiquidityMode>("add");
  const [ethAmount, setEthAmount] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
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

  const { data: poolData, refetch: refetchPool } = useReadContract({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "pools",
    args: [selectedTokenAddress],
  });

  const { data: userLiquidity, refetch: refetchUserLiquidity } = useReadContract({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "liquidity",
    args: address ? [selectedTokenAddress, address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedTokenAddress,
    abi: ERC20_MIN_ABI,
    functionName: "allowance",
    args: address ? [address, EXCHANGE_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address && liquidityMode === "add",
    },
  });

  const totalLiquidity = poolData ? poolData[2] : 0n;
  const poolExists = poolData ? poolData[3] : false;

  useEffect(() => {
    if (!isConnected) return;
    refetchEth();
    refetchToken();
    refetchPool();
    refetchUserLiquidity();
    if (liquidityMode === "add") refetchAllowance();
  }, [
    blockNumber,
    isConnected,
    liquidityMode,
    refetchEth,
    refetchToken,
    refetchPool,
    refetchUserLiquidity,
    refetchAllowance,
  ]);

  const {
    writeContract: writeLiquidity,
    isPending: isLiquidityPending,
    error: liquidityError,
  } = useWriteContract();

  const { writeContract: writeApprove, isPending: isApprovePending } =
    useWriteContract();

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}` | undefined,
    });

  useEffect(() => {
    if (isTxSuccess) {
      setEthAmount("");
      setTokenAmount("");
      setTxHash(null);
      refetchEth();
      refetchToken();
      refetchPool();
      refetchUserLiquidity();
      refetchAllowance();
    }
  }, [
    isTxSuccess,
    refetchEth,
    refetchToken,
    refetchPool,
    refetchUserLiquidity,
    refetchAllowance,
  ]);

  const parsedEthAmount = useMemo(() => {
    if (!ethAmount || isNaN(Number(ethAmount))) return 0n;
    try {
      return parseEther(ethAmount);
    } catch {
      return 0n;
    }
  }, [ethAmount]);

  const parsedTokenAmount = useMemo(() => {
    if (!tokenAmount || isNaN(Number(tokenAmount))) return 0n;
    try {
      return parseUnits(tokenAmount, decimals);
    } catch {
      return 0n;
    }
  }, [tokenAmount, decimals]);

  const displayEthBalance = ethBalance
    ? formatEther(ethBalance.value)
    : "0";
  const displayTokenBalance = tokenBalance
    ? formatUnits(tokenBalance as bigint, decimals)
    : "0";

  const isBalanceLoading = isEthLoading || isTokenLoading;

  const currentAllowanceBN = allowance ? (allowance as bigint) : 0n;

  const needsApproval =
    liquidityMode === "add" &&
    parsedTokenAmount > 0n &&
    currentAllowanceBN < parsedTokenAmount;

  const isEthValid = parsedEthAmount > 0n;
  const isTokenValid = parsedTokenAmount > 0n;
  const isValidInput = isEthValid && isTokenValid;

  const isInsufficientEthBalance =
    ethBalance?.value ? ethBalance.value < parsedEthAmount : false;

  const isInsufficientTokenBalance =
    tokenBalance ? (tokenBalance as bigint) < parsedTokenAmount : false;

  const isInsufficientLiquidity =
    liquidityMode === "remove" && userLiquidity
      ? (userLiquidity as bigint) < parsedEthAmount
      : false;

  const handleApprove = () => {
    writeApprove(
      {
        address: selectedTokenAddress,
        abi: ERC20_MIN_ABI,
        functionName: "approve",
        args: [EXCHANGE_CONTRACT_ADDRESS, parsedTokenAmount],
      },
      {
        onError: (err) => console.error("Approve failed", err),
      },
    );
  };

  const handleLiquidity = () => {
    if (!isValidInput) return;

    const deadline = Math.floor(Date.now() / 1000) + 20 * 60; // 20 minutes

    if (liquidityMode === "add") {
      writeLiquidity(
        {
          address: EXCHANGE_CONTRACT_ADDRESS,
          abi: EXCHANGE_BASE_ABI,
          functionName: "addLiquidity",
          args: [selectedTokenAddress, parsedTokenAmount, BigInt(deadline)],
          value: parsedEthAmount,
        },
        {
          onSuccess: (hash) => setTxHash(hash),
          onError: (err) => console.error("Add liquidity failed", err),
        },
      );
    } else {
      writeLiquidity(
        {
          address: EXCHANGE_CONTRACT_ADDRESS,
          abi: EXCHANGE_BASE_ABI,
          functionName: "removeLiquidity",
          args: [selectedTokenAddress, parsedEthAmount, BigInt(deadline)],
        },
        {
          onSuccess: (hash) => setTxHash(hash),
          onError: (err) => console.error("Remove liquidity failed", err),
        },
      );
    }
  };

  const handleMaxEth = () => {
    if (ethBalance) {
      const value = ethBalance.value - parseEther("0.005");
      if (value > 0n) {
        setEthAmount(formatEther(value));
      } else {
        setEthAmount(formatEther(ethBalance.value));
      }
    }
  };

  const handleMaxToken = () => {
    if (tokenBalance) {
      setTokenAmount(formatUnits(tokenBalance as bigint, decimals));
    }
  };

  const handleMaxLiquidity = () => {
    if (userLiquidity) {
      setEthAmount(formatEther(userLiquidity as bigint));
    }
  };

  const userLiquidityDisplay = userLiquidity
    ? formatEther(userLiquidity as bigint)
    : "0";

  const poolShare = useMemo(() => {
    if (totalLiquidity === 0n || !userLiquidity) return "0";
    const share = ((userLiquidity as bigint) * 10000n) / totalLiquidity;
    return (Number(share) / 100).toFixed(2);
  }, [userLiquidity, totalLiquidity]);

  return (
    <div className="w-full flex justify-center items-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] bg-purple-neon/20 blur-[100px] rounded-full pointer-events-none z-0 animate-pulse-slow" />

      <div className="w-full max-w-[480px] relative z-10 backdrop-blur-2xl bg-[#0D0D12]/90 rounded-[32px] border border-white/10 shadow-2xl shadow-black overflow-hidden ring-1 ring-white/5">
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-purple-neon" />
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              {liquidityMode === "add" ? "Add" : "Remove"} Liquidity
            </h2>
          </div>
          <button className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all group">
            <Settings2 className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setLiquidityMode("add")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                liquidityMode === "add"
                  ? "bg-purple-neon text-white shadow-lg shadow-purple-neon/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Add Liquidity
            </button>
            <button
              onClick={() => setLiquidityMode("remove")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                liquidityMode === "remove"
                  ? "bg-crimson-neon text-white shadow-lg shadow-crimson-neon/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Remove Liquidity
            </button>
          </div>
        </div>

        <div className="p-2 space-y-1">
          <LiquidityInputPanel
            label={liquidityMode === "add" ? "Deposit ETH" : "Remove Liquidity (ETH)"}
            amount={ethAmount}
            onAmountChange={setEthAmount}
            displayBalance={liquidityMode === "remove" ? userLiquidityDisplay : displayEthBalance}
            isBalanceLoading={isBalanceLoading}
            isConnected={isConnected}
            isTxConfirming={isTxConfirming}
            onMaxClick={liquidityMode === "remove" ? handleMaxLiquidity : handleMaxEth}
            isInsufficientBalance={liquidityMode === "remove" ? isInsufficientLiquidity : isInsufficientEthBalance}
            tokenSelector={
              <TokenSelector
                isEth={true}
                selected={selectedTokenAddress}
                onSelect={(val) =>
                  setSelectedTokenAddress(val as `0x${string}`)
                }
                supportedTokens={supportedTokens}
                isLoadingTokens={isLoadingTokens}
              />
            }
          />

          <div className="relative h-1 z-20">
            <div className="absolute left-1/2 -translate-x-1/2 -top-[18px]">
              <div className="p-2 rounded-xl bg-[#0D0D12] border-[4px] border-[#0D0D12] shadow-xl">
                <div className="bg-[#2B2B36] p-2 rounded-lg">
                  <Droplets className="w-4 h-4 text-purple-electric" />
                </div>
              </div>
            </div>
          </div>

          {liquidityMode === "add" && (
            <LiquidityInputPanel
              label="Deposit Tokens"
              amount={tokenAmount}
              onAmountChange={setTokenAmount}
              displayBalance={displayTokenBalance}
              isBalanceLoading={isBalanceLoading}
              isConnected={isConnected}
              isTxConfirming={isTxConfirming}
              onMaxClick={handleMaxToken}
              isInsufficientBalance={isInsufficientTokenBalance}
              tokenSelector={
                <TokenSelector
                  isEth={false}
                  selected={selectedTokenAddress}
                  onSelect={(val) =>
                    setSelectedTokenAddress(val as `0x${string}`)
                  }
                  supportedTokens={supportedTokens}
                  isLoadingTokens={isLoadingTokens}
                  disabled={false}
                />
              }
            />
          )}
        </div>

        <div className="p-4 pt-2">
          {(ethAmount || tokenAmount) && (
            <LiquidityDetails
              slippageTolerance={slippageTolerance}
              onSlippageChange={setSlippageTolerance}
              ethAmount={ethAmount}
              tokenAmount={tokenAmount}
              poolShare={poolShare}
              liquidityMode={liquidityMode}
              poolExists={poolExists}
            />
          )}

          <TransactionStatus
            txHash={txHash}
            isTxConfirming={isTxConfirming}
            isTxSuccess={isTxSuccess}
            liquidityError={liquidityError}
          />

          <LiquidityButton
            isConnected={isConnected}
            isValidInput={isValidInput}
            isInsufficientEthBalance={isInsufficientEthBalance}
            isInsufficientTokenBalance={isInsufficientTokenBalance}
            isInsufficientLiquidity={isInsufficientLiquidity}
            isTxConfirming={isTxConfirming}
            isLiquidityPending={isLiquidityPending}
            isApprovePending={isApprovePending}
            needsApproval={needsApproval}
            liquidityMode={liquidityMode}
            tokenSymbol={tokenConfig?.symbol}
            onApprove={handleApprove}
            onLiquidity={handleLiquidity}
          />
        </div>
      </div>
    </div>
  );
}
