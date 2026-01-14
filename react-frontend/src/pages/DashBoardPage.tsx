/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";
import { EXCHANGE_CONTRACT_ADDRESS } from "../config/constants";
import { getSymbolsAsync } from "../api";
import {
  Wallet,
  Coins,
  Database,
  User,
  ShieldCheck,
  Activity,
  ChevronDown,
} from "lucide-react";
import { Card } from "../components/Card";
import { StatRow } from "../components/StatRow";
import { Skeleton } from "../components/Skeleton";

const formatValue = (
  raw: any,
  decimals: number = 18,
  maxFraction: number = 4
) => {
  if (raw === undefined || raw === null) return null;
  try {
    const floatVal = parseFloat(formatUnits(raw, decimals));
    return floatVal.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFraction,
    });
  } catch {
    return "0";
  }
};

interface Token {
  name: string;
  symbol: string;
  address: `0x${string}`;
}

export const DashboardPage = () => {
  const { address, isConnected } = useAccount();
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

  const [selectedTokenAddr, setSelectedTokenAddr] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000000000"
  );
  useEffect(() => {
    if (
      supportedTokens.length > 0 &&
      selectedTokenAddr === "0x0000000000000000000000000000000000000000"
    ) {
      const firstToken = supportedTokens[0];
      if (firstToken) {
        setSelectedTokenAddr(firstToken.address);
      }
    }
  }, [supportedTokens, selectedTokenAddr]);

  const currentTokenConfig = useMemo(
    () =>
      supportedTokens.find((t) => t.address === selectedTokenAddr) ||
      supportedTokens[0] || {
        name: "Token",
        symbol: "TOKEN",
        address: selectedTokenAddr,
      },
    [selectedTokenAddr, supportedTokens]
  );

  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
    address,
  });

  const { data: tokenSymbol, isLoading: isSymbolLoading } = useReadContract({
    address: selectedTokenAddr,
    abi: ERC20_MIN_ABI,
    functionName: "symbol",
  });

  const { data: tokenDecimals } = useReadContract({
    address: selectedTokenAddr,
    abi: ERC20_MIN_ABI,
    functionName: "decimals",
  });

  const { data: tokenBalanceRaw, isLoading: isTokenBalanceLoading } =
    useReadContract({
      address: selectedTokenAddr,
      abi: ERC20_MIN_ABI,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
    });

  const { data: poolData, isLoading: isPoolLoading } = useReadContract({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "pools",
    args: [selectedTokenAddr],
  });

  const { data: userLiquidityRaw, isLoading: isLiquidityLoading } =
    useReadContract({
      address: EXCHANGE_CONTRACT_ADDRESS,
      abi: EXCHANGE_BASE_ABI,
      functionName: "liquidity",
      args: address ? [selectedTokenAddr, address] : undefined,
    });

  const ethReserve = poolData ? poolData[0] : undefined;
  const tokenReserve = poolData ? poolData[1] : undefined;
  const totalLiquidityRaw = poolData ? poolData[2] : undefined;

  const tokenDecimalsNum = tokenDecimals ? Number(tokenDecimals) : 18;

  const displayNative = formatValue(nativeBalance?.value, 18);
  const displayToken = formatValue(tokenBalanceRaw, tokenDecimalsNum);
  const displayReserveETH = formatValue(ethReserve, 18);
  const displayReserveToken = formatValue(tokenReserve, tokenDecimalsNum);
  const displayUserLiquidity = formatValue(userLiquidityRaw, 18);
  const displayTotalLiquidity = formatValue(totalLiquidityRaw, 18);

  const activeSymbol = tokenSymbol ?? currentTokenConfig?.symbol ?? "Token";

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300/70 bg-purple-900/10 px-3 py-1 rounded-full border border-purple-500/10 w-fit">
            <Activity className="w-3 h-3 text-green-400 animate-pulse" />
            <span>
              Actual sepolia <data value=""></data>
            </span>
          </div>
        </div>

        <div className="relative group w-full md:w-64">
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block pl-1">
            Active tokens
          </label>
          <div className="relative">
            <select
              value={selectedTokenAddr}
              onChange={(e) =>
                setSelectedTokenAddr(e.target.value as `0x${string}`)
              }
              disabled={isLoadingTokens || supportedTokens.length === 0}
              className="w-full appearance-none bg-surface/80 backdrop-blur border border-white/10 text-white font-mono text-sm py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer hover:bg-white/5 hover:border-white/20 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingTokens ? (
                <option>Loading tokens...</option>
              ) : supportedTokens.length === 0 ? (
                <option>No tokens available</option>
              ) : (
                supportedTokens.map((token) => (
                  <option
                    key={token.address}
                    value={token.address}
                    className="bg-surface text-white py-2"
                  >
                    {token.name} ({token.symbol})
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none group-hover:text-purple-300 transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-between h-full group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                Wallet
              </span>
            </div>
            <div className="space-y-2">
              {isNativeLoading ? (
                <Skeleton className="w-32 h-10" />
              ) : (
                <div className="text-4xl font-mono text-white tracking-tight font-medium">
                  {displayNative}
                </div>
              )}
              <div className="text-xs text-purple-300/50 uppercase font-bold tracking-wider pl-0.5">
                ETH Balance
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between h-full group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 bg-crimson-blood/20 rounded-xl border border-crimson-neon/20 group-hover:border-crimson-neon/40 transition-colors">
                <Coins className="w-6 h-6 text-crimson-neon" />
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                Wallet
              </span>
            </div>
            <div className="space-y-2">
              {isTokenBalanceLoading || isSymbolLoading ? (
                <Skeleton className="w-32 h-10" />
              ) : (
                <div className="text-4xl font-mono text-white tracking-tight font-medium">
                  {displayToken}
                </div>
              )}
              <div className="text-xs text-crimson-300/50 uppercase font-bold tracking-wider pl-0.5">
                {activeSymbol} Balance
              </div>
            </div>
          </Card>
        </div>

        <Card className="md:col-span-4 flex flex-col justify-center gap-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <ShieldCheck className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Contract Details
            </span>
          </div>
          <div className="space-y-5">
            <div className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Exchange
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="font-mono text-[11px] text-purple-200/90 truncate bg-purple-900/20 p-2.5 border border-purple-500/20 rounded-lg group-hover:border-purple-500/40 transition-all select-all">
                <a
                  href={`https://sepolia.etherscan.io/address/${EXCHANGE_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-purple-200/90 hover:underline"
                >
                  {EXCHANGE_CONTRACT_ADDRESS}
                </a>
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Token Asset
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-crimson-neon shadow-[0_0_8px_rgba(255,0,60,0.5)]" />
              </div>
              <div className="font-mono text-[11px] text-crimson-200/90 truncate bg-crimson-blood/20 p-2.5 border border-crimson-neon/20 rounded-lg group-hover:border-crimson-neon/40 transition-all select-all">
                <a
                  href={`https://sepolia.etherscan.io/address/${selectedTokenAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-crimson-200/90 hover:underline"
                >
                  {selectedTokenAddr}
                </a>
              </div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Database className="w-5 h-5 text-purple-neon" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
              Liquidity Pool
            </h3>
          </div>
          <div className="space-y-1">
            <StatRow
              label="Pooled ETH"
              value={displayReserveETH || "0"}
              unit="ETH"
              isLoading={isPoolLoading}
            />
            <StatRow
              label={`Pooled ${activeSymbol}`}
              value={displayReserveToken || "0"}
              unit={activeSymbol as string}
              isLoading={isPoolLoading || isSymbolLoading}
            />
            <div className="mt-2">
              <StatRow
                label="Total Liquidity In Tokens"
                value={displayTotalLiquidity || "0"}
                unit="LP"
                highlight
                isLoading={isPoolLoading}
              />
            </div>
          </div>
        </Card>

        <Card className="md:col-span-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5 relative z-10">
            <div className="p-2 bg-crimson-blood/20 rounded-lg">
              <User className="w-5 h-5 text-crimson-neon" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
              Your Information
            </h3>
          </div>

          {!isConnected ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-white/5 border-dashed relative z-10">
              <span className="text-gray-400 font-medium mb-1">
                Wallet Disconnected
              </span>
              <span className="text-xs text-gray-500 max-w-[200px]">
                Connect your wallet to view your liquidity provider statistics.
              </span>
            </div>
          ) : (
            <div className="space-y-1 relative z-10">
              <StatRow
                label="Your ETH Share"
                value={displayNative || "0"}
                unit="ETH"
                isLoading={isNativeLoading}
              />
              <StatRow
                label={`Your ${activeSymbol} Share`}
                value={displayToken || "0"}
                unit={activeSymbol as string}
                isLoading={isTokenBalanceLoading}
              />
              <div className="mt-4 pt-4 border-t border-dashed border-white/10">
                <StatRow
                  label="Your LP Tokens"
                  value={displayUserLiquidity || "0"}
                  unit="LP"
                  highlight
                  isLoading={isLiquidityLoading}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
