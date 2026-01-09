/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { ArrowDownUp, Zap, AlertCircle } from "lucide-react";
import {
  EXCHANGE_CONTRACT_ADDRESS,
  SUPPORTED_TOKENS,
} from "../config/constants";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";
import { Card } from "./Card";
import { ConnectKitButton } from "connectkit";

type SwapMode = "ethToToken" | "tokenToEth";

export function TokenSwap() {
  const { address, isConnected } = useAccount();

  const [swapMode, setSwapMode] = useState<SwapMode>("ethToToken");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<`0x${string}`>(
    SUPPORTED_TOKENS[0].address
  );
  const [slippageTolerance, setSlippageTolerance] = useState<string>("0.5");

  const tokenConfig = useMemo(
    () =>
      SUPPORTED_TOKENS.find((t) => t.address === selectedToken) ||
      SUPPORTED_TOKENS[0],
    [selectedToken]
  );

  const { data: ethBalance } = useBalance({ address });

  const { data: tokenDecimals } = useReadContract({
    address: selectedToken,
    abi: ERC20_MIN_ABI,
    functionName: "decimals",
  });

  const { data: tokenBalance } = useReadContract({
    address: selectedToken,
    abi: ERC20_MIN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: amountOut } = useReadContract({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "getAmountOut",
    args: [
      inputAmount && swapMode === "ethToToken"
        ? parseEther(inputAmount)
        : BigInt(0),
      swapMode === "ethToToken" ? BigInt(1) : BigInt(1),
      swapMode === "ethToToken" ? BigInt(1) : BigInt(1),
    ],
  });

  const decimalsNum = tokenDecimals ? Number(tokenDecimals as any) : 18;
  const inputBigInt =
    swapMode === "ethToToken"
      ? inputAmount
        ? parseEther(inputAmount)
        : BigInt(0)
      : inputAmount
      ? parseUnits(inputAmount, decimalsNum)
      : BigInt(0);

  const minOutputBigInt = amountOut
    ? (amountOut *
        BigInt(Math.floor((1 - Number(slippageTolerance) / 100) * 10000))) /
      BigInt(10000)
    : BigInt(0);

  const { writeContract: swapETH, isPending: isPendingETH } =
    useWriteContract();
  const { writeContract: swapTokens, isPending: isPendingTokens } =
    useWriteContract();
  const { writeContract: approveToken, isPending: isPendingApprove } =
    useWriteContract();

  const [txHash, setTxHash] = useState<string | null>(null);
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}` | undefined,
    });

  const handleSwap = async () => {
    if (!address || !inputAmount) return;

    try {
      if (swapMode === "ethToToken") {
        swapETH(
          {
            address: EXCHANGE_CONTRACT_ADDRESS,
            abi: EXCHANGE_BASE_ABI,
            functionName: "swapExactETHForTokens",
            args: [selectedToken, minOutputBigInt],
            value: inputBigInt,
          },
          {
            onSuccess: (hash) => {
              setTxHash(hash);
              setInputAmount("");
            },
          }
        );
      } else {
        swapTokens(
          {
            address: EXCHANGE_CONTRACT_ADDRESS,
            abi: EXCHANGE_BASE_ABI,
            functionName: "swapExactTokensForETH",
            args: [selectedToken, inputBigInt, minOutputBigInt],
          },
          {
            onSuccess: (hash) => {
              setTxHash(hash);
              setInputAmount("");
            },
          }
        );
      }
    } catch (err) {
      console.error("Swap error:", err);
    }
  };

  const handleApprove = async () => {
    if (!selectedToken || !inputBigInt) return;

    try {
      approveToken(
        {
          address: selectedToken,
          abi: ERC20_MIN_ABI,
          functionName: "approve",
          args: [EXCHANGE_CONTRACT_ADDRESS, inputBigInt],
        },
        {
          onSuccess: () => {
            setTimeout(handleSwap, 1000);
          },
        }
      );
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const displayBalance =
    swapMode === "ethToToken"
      ? ethBalance?.value
        ? parseFloat(formatEther(ethBalance.value)).toFixed(4)
        : "0.0000"
      : tokenBalance
      ? parseFloat(formatUnits(tokenBalance as bigint, decimalsNum)).toFixed(4)
      : "0.0000";

  const displayOutput = amountOut
    ? swapMode === "ethToToken"
      ? parseFloat(formatUnits(amountOut as bigint, decimalsNum)).toFixed(4)
      : parseFloat(formatEther(amountOut as bigint)).toFixed(4)
    : "0.0000";

  const isReady =
    isConnected && inputAmount && Number(inputAmount) > 0 && amountOut;

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Swap</h2>
        <button
          onClick={() =>
            setSwapMode(swapMode === "ethToToken" ? "tokenToEth" : "ethToToken")
          }
          className="p-2 rounded-lg bg-purple-900/20 border border-purple-500/20 hover:bg-purple-900/40 transition-colors"
          title="Reverse swap direction"
        >
          <ArrowDownUp className="w-4 h-4 text-purple-neon" />
        </button>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-200">Connect wallet to swap</span>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <label className="text-xs text-slate-400 uppercase">You Send</label>
            <span className="text-xs text-slate-500">
              Balance: {displayBalance}{" "}
              {swapMode === "ethToToken" ? "ETH" : tokenConfig.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-mono text-white outline-none"
              disabled={!isConnected}
            />
            <span className="text-lg font-semibold text-slate-300">
              {swapMode === "ethToToken" ? "ETH" : tokenConfig.symbol}
            </span>
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center">
          <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-500/20">
            <ArrowDownUp className="w-4 h-4 text-purple-neon" />
          </div>
        </div>

        {/* Token Selector (if sending ETH) */}
        {swapMode === "ethToToken" && (
          <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
            <label className="text-xs text-slate-400 uppercase mb-2 block">
              Select Token
            </label>
            <select
              value={selectedToken}
              onChange={(e) =>
                setSelectedToken(e.target.value as `0x${string}`)
              }
              className="w-full bg-slate-800 text-white rounded px-3 py-2 border border-slate-600 focus:border-purple-500 outline-none"
            >
              {SUPPORTED_TOKENS.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Output Section */}
        <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <label className="text-xs text-slate-400 uppercase">
              You Receive
            </label>
            <span className="text-xs text-slate-500">≈ {displayOutput}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono text-slate-400">
              {displayOutput}
            </span>
            <span className="text-lg font-semibold text-slate-300">
              {swapMode === "ethToToken" ? tokenConfig.symbol : "ETH"}
            </span>
          </div>
        </div>
      </div>

      {/* Slippage & Fee Info */}
      <div className="mb-6 grid grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-900/20 rounded p-3">
          <div className="text-slate-500">Slippage</div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(e.target.value)}
              className="w-12 bg-transparent text-white outline-none font-mono"
              step="0.1"
              min="0"
            />
            <span className="text-slate-400">%</span>
          </div>
        </div>
        <div className="bg-slate-900/20 rounded p-3">
          <div className="text-slate-500">Fee</div>
          <div className="text-white font-semibold">0.3%</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-2">
        {!isConnected ? (
          <div className="w-full">
            <ConnectKitButton />
          </div>
        ) : swapMode === "tokenToEth" && !isPendingApprove ? (
          <>
            <button
              onClick={handleApprove}
              disabled={!isReady || isPendingApprove || isTxConfirming}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              {isPendingApprove ? "Approving..." : "Approve Token"}
            </button>
            <button
              onClick={handleSwap}
              disabled={!isReady || isPendingTokens || isTxConfirming}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              {isPendingTokens || isTxConfirming
                ? "Swapping..."
                : "Swap Tokens"}
            </button>
          </>
        ) : (
          <button
            onClick={handleSwap}
            disabled={!isReady || isPendingETH || isTxConfirming}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            {isPendingETH || isTxConfirming ? "Swapping..." : "Swap Now"}
          </button>
        )}
      </div>

      {/* TX Status */}
      {txHash && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg text-sm text-green-200">
          {isTxConfirming ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Transaction confirming...
            </div>
          ) : isTxSuccess ? (
            <div>✓ Swap successful!</div>
          ) : (
            <div>Tx: {txHash.slice(0, 10)}...</div>
          )}
        </div>
      )}
    </Card>
  );
}
