/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { ConnectKitButton } from "connectkit"; 
import { EXCHANGE_BASE_ABI, ERC20_MIN_ABI } from "../config/contractsAbis";
import { EXCHANGE_CONTRACT_ADDRESS } from "../config/constants";
import { getSymbolsAsync } from "../utils/api";
import { Wallet, Coins, Lock, ArrowRight } from "lucide-react"; 
import { BalanceCard } from "../components/dashboard/BalanceCard";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { ContractAddressCard } from "../components/dashboard/ContractAddressCard";
import { LiquidityPoolCard } from "../components/dashboard/LiquidityPoolCard";
import { UserInfoCard } from "../components/dashboard/UserInfoCard";
import type { Token } from "../config/types";
import { formatValue } from "../utils/format";

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
      if (firstToken) setSelectedTokenAddr(firstToken.address);
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

  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({ address });

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

  const { data: tokenBalanceRaw, isLoading: isTokenBalanceLoading } = useReadContract({
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

  const { data: userLiquidityRaw, isLoading: isLiquidityLoading } = useReadContract({
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
    <div className="space-y-8 pb-20 animate-fade-in">
      <DashboardHeader
        selectedTokenAddr={selectedTokenAddr}
        supportedTokens={supportedTokens}
        isLoadingTokens={isLoadingTokens}
        onTokenChange={setSelectedTokenAddr}
      />
      
      {!isConnected ? (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface to-background p-8 md:p-12 text-center">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-neon/20 rounded-full blur-[80px] pointer-events-none" />
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-crimson-neon/10 rounded-full blur-[80px] pointer-events-none" />
             <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-6">
                <div className="p-4 rounded-full bg-white/5 border border-white/5 mb-2">
                   <Lock className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">
                  Подключите кошелек
                </h2>
                <p className="text-gray-400 font-mono text-sm md:text-base leading-relaxed">
                  Для доступа к балансу и управлению ликвидностью необходимо подключить ваш Web3 кошелек.
                  Ниже представлена общая статистика протокола.
                </p>
                <div className="pt-2">
                   <ConnectKitButton.Custom>
                      {({ show }) => (
                        <button 
                          onClick={show}
                          className="group flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-purple-neon hover:text-white font-bold uppercase tracking-wider transition-all duration-300 rounded-sm skew-x-[-10deg]"
                        >
                          <span className="skew-x-[10deg] inline-flex items-center gap-2">
                             Connect Wallet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      )}
                   </ConnectKitButton.Custom>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidityPoolCard
              activeSymbol={activeSymbol}
              ethReserve={displayReserveETH}
              tokenReserve={displayReserveToken}
              totalLiquidity={displayTotalLiquidity}
              isLoading={isPoolLoading}
              isSymbolLoading={isSymbolLoading}
            />
             <ContractAddressCard
              exchangeAddress={EXCHANGE_CONTRACT_ADDRESS}
              tokenAddress={selectedTokenAddr}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <BalanceCard
              title="Balance"
              value={displayNative}
              unit="ETH"
              icon={Wallet}
              isLoading={isNativeLoading}
              iconColor="#B026FF"
              iconBgColor="bg-purple-500/10"
              iconBorderColor="border-purple-500/20"
              labelColor="text-purple-300/50"
            />
            <BalanceCard
              title="Balance"
              value={displayToken}
              unit={activeSymbol}
              icon={Coins}
              isLoading={isTokenBalanceLoading || isSymbolLoading}
              iconColor="#FF003C"
              iconBgColor="bg-crimson-blood/20"
              iconBorderColor="border-crimson-neon/20"
              labelColor="text-crimson-300/50"
            />
          </div>

          <div className="md:col-span-4 h-full">
            <ContractAddressCard
              exchangeAddress={EXCHANGE_CONTRACT_ADDRESS}
              tokenAddress={selectedTokenAddr}
            />
          </div>

          <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiquidityPoolCard
              activeSymbol={activeSymbol}
              ethReserve={displayReserveETH}
              tokenReserve={displayReserveToken}
              totalLiquidity={displayTotalLiquidity}
              isLoading={isPoolLoading}
              isSymbolLoading={isSymbolLoading}
            />
            <UserInfoCard
              isConnected={isConnected}
              activeSymbol={activeSymbol}
              ethBalance={displayNative}
              tokenBalance={displayToken}
              userLiquidity={displayUserLiquidity}
              isEthLoading={isNativeLoading}
              isTokenLoading={isTokenBalanceLoading}
              isLiquidityLoading={isLiquidityLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};