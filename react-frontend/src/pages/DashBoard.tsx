/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useAccount, useBalance, useReadContract, usePublicClient } from 'wagmi';
import { formatEther, formatUnits } from "viem";
import { ConnectKitButton } from "connectkit";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";

const EXCHANGE_ADDRESS = import.meta.env
  .VITE_EXCHANGE_CONTRACT_ADDRESS as `0x${string}`;
const TOKEN_ADDRESS = import.meta.env
  .VITE_TOPCOIN_CONTRACT_ADDRESS as `0x${string}`;

export const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const provider = usePublicClient();

  const { data: nativeBalance } = useBalance({ address });

  const { data: tokenSymbol } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_MIN_ABI,
    functionName: "symbol",
  });
  const { data: tokenDecimals } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_MIN_ABI,
    functionName: "decimals",
  });
  const { data: tokenBalanceRaw } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_MIN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: reserveETH } = useReadContract({
    address: EXCHANGE_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "reserveETH",
  });
  const { data: reserveToken } = useReadContract({
    address: EXCHANGE_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "reserveToken",
  });
  const { data: userLiquidityRaw } = useReadContract({
    address: EXCHANGE_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "liquidity",
    args: address ? [address] : undefined,
  });
  const { data: totalLiquidityRaw } = useReadContract({
    address: EXCHANGE_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "totalLiquidity",
  });

  const formatNative = (raw: any) =>
    raw ? parseFloat(formatEther(raw)).toFixed(4) : "0.0000";
  const tokenDecimalsNum = tokenDecimals ?? 18;
  const formatToken = (raw: any) => {
    try {
      if (!raw) return "0.0";
      return parseFloat(
        formatUnits(raw as bigint, Number(tokenDecimalsNum))
      ).toFixed(4);
    } catch (e) {
      return "0.0";
    }
  };

  const displayNative = formatNative(nativeBalance?.value);
  const displayToken = formatToken(tokenBalanceRaw);
  const displayReserveETH = reserveETH
    ? parseFloat(formatEther(reserveETH)).toFixed(4)
    : "0.0000";
  const displayReserveToken = formatToken(reserveToken);
  const displayUserLiquidity = userLiquidityRaw
    ? parseFloat(formatEther(userLiquidityRaw)).toFixed(4)
    : "0.0000";
  const displayTotalLiquidity = totalLiquidityRaw
    ? parseFloat(formatEther(totalLiquidityRaw)).toFixed(4)
    : "0.0000";

  const Stat = ({
    label,
    value,
    unit,
  }: {
    label: string;
    value: string;
    unit?: string;
  }) => (
    <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700">
      <div className="text-xs text-slate-300 uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl text-white">
        {value} <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div>
          <ConnectKitButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Native Balance" value={displayNative} unit="ETH" />
          <Stat
            label={`Token Balance (${tokenSymbol ?? "TOKEN"})`}
            value={displayToken}
            unit={`${tokenSymbol ?? "TKN"}`}
          />
          <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-300 uppercase tracking-wide">
              Addresses
            </div>
            <div className="mt-2 text-sm break-all">
              <div>
                <strong>Wallet:</strong> {address ?? "-"}
              </div>
              <div className="mt-2">
                <strong>Token:</strong> {TOKEN_ADDRESS}
              </div>
              <div className="mt-2">
                <strong>Exchange:</strong> {EXCHANGE_ADDRESS}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700">
            <h3 className="font-semibold">Pool / Exchange</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>Reserve (ETH)</span>
                <span className="font-mono">{displayReserveETH} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Reserve (Token)</span>
                <span className="font-mono">
                  {displayReserveToken} {`${tokenSymbol ?? "TKN"}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Liquidity</span>
                <span className="font-mono">{displayTotalLiquidity} LP</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700">
            <h3 className="font-semibold">Your Position</h3>
            {!isConnected ? (
              <div className="mt-4 text-sm text-slate-300">
                Connect your wallet to see position details.
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <div className="flex justify-between">
                  <span>Wallet ETH</span>
                  <span className="font-mono">{displayNative} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Wallet Token</span>
                  <span className="font-mono">
                    {displayToken} {`${tokenSymbol ?? "TKN"}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Your Liquidity</span>
                  <span className="font-mono">{displayUserLiquidity} LP</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="text-xs text-slate-400">
          Data comes from the connected provider (Sepolia by default). Refreshes
          on new blocks when supported by the provider.
        </footer>
      </main>
    </div>
  );
};
