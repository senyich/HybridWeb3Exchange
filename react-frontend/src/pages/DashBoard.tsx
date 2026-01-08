/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useAccount, useBalance, useReadContract, usePublicClient } from 'wagmi';
import { formatEther, formatUnits } from "viem";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";
import { Wallet, Coins, ArrowRightLeft, Database, User, ShieldCheck, Activity } from "lucide-react";

const EXCHANGE_ADDRESS = import.meta.env.VITE_EXCHANGE_CONTRACT_ADDRESS as `0x${string}`;
const TOKEN_ADDRESS = import.meta.env.VITE_TOPCOIN_CONTRACT_ADDRESS as `0x${string}`;

export const Dashboard = () => {
  const { address, isConnected } = useAccount();

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

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative overflow-hidden bg-glass-gradient border border-white/5 backdrop-blur-sm p-6 transition-all hover:border-purple-500/20 ${className}`}>
      {children}
    </div>
  );

  const StatRow = ({ label, value, unit, highlight = false }: { label: string; value: string; unit?: string; highlight?: boolean }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <div className="flex items-center gap-2 font-mono">
        <span className={`text-lg ${highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-crimson-neon font-bold" : "text-gray-200"}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-gray-600 uppercase">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Dashboard</h1>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <Activity className="w-3 h-3 text-green-500" />
          <span>REAL-TIME DATA FEED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Stats */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-900/10 rounded-lg border border-purple-500/10">
                <Wallet className="w-5 h-5 text-purple-neon" />
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Wallet Balance</span>
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-mono text-white tracking-tight">{displayNative}</div>
               <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">ETH (Native)</div>
            </div>
          </Card>

          <Card>
             <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-crimson-blood/10 rounded-lg border border-crimson-neon/10">
                <Coins className="w-5 h-5 text-crimson-neon" />
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Token Balance</span>
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-mono text-white tracking-tight">{displayToken}</div>
               <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{`${tokenSymbol ?? "TKN"}`}</div>
            </div>
          </Card>
        </div>

        <Card className="md:col-span-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Contract Data</span>
            </div>
            <div className="space-y-4">
                <div className="group">
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Exchange Contract</div>
                    <div className="font-mono text-xs text-purple-300/80 truncate bg-purple-900/10 p-2 border border-purple-500/10 rounded group-hover:border-purple-500/30 transition-colors">
                        {EXCHANGE_ADDRESS}
                    </div>
                </div>
                <div className="group">
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Token Contract</div>
                    <div className="font-mono text-xs text-crimson-300/80 truncate bg-crimson-blood/10 p-2 border border-crimson-neon/10 rounded group-hover:border-crimson-neon/30 transition-colors">
                        {TOKEN_ADDRESS}
                    </div>
                </div>
            </div>
        </Card>

        <Card className="md:col-span-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <Database className="w-5 h-5 text-purple-neon" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Liquidity Pool</h3>
            </div>
            <div className="space-y-1">
                <StatRow label="Reserve ETH" value={displayReserveETH} unit="ETH" />
                <StatRow label="Reserve Token" value={displayReserveToken} unit={tokenSymbol as string} />
                <StatRow label="Total Liquidity" value={displayTotalLiquidity} unit="LP" highlight />
            </div>
        </Card>

        <Card className="md:col-span-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5 relative z-10">
                <User className="w-5 h-5 text-crimson-neon" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Your Position</h3>
            </div>
            
            {!isConnected ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 relative z-10">
                <span className="text-sm text-gray-400 mb-2">Wallet not connected</span>
                <span className="text-xs text-gray-600">Connect to view your LP share</span>
              </div>
            ) : (
              <div className="space-y-1 relative z-10">
                 <StatRow label="Wallet ETH" value={displayNative} unit="ETH" />
                 <StatRow label="Wallet Token" value={displayToken} unit={tokenSymbol as string} />
                 <div className="mt-4 pt-4 border-t border-dashed border-white/10">
                    <StatRow label="Your Liquidity Share" value={displayUserLiquidity} unit="LP" highlight />
                 </div>
              </div>
            )}
        </Card>
      </div>
    </div>
  );
};