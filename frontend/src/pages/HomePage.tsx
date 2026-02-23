// pages/HomePage.tsx
import { useState, useEffect, useMemo } from "react";
import { useReadContract } from "wagmi";
import { ConnectKitButton } from "connectkit";
import {
  Zap,
  Shield,
  BarChart3,
  Lock,
  ArrowRight,
} from "lucide-react";
import { EXCHANGE_BASE_ABI } from "../config/contractsAbis";
import { EXCHANGE_CONTRACT_ADDRESS } from "../config/constants";
import { getSymbolsAsync } from "../utils/api";
import { Card } from "../components/Card";
import { EthPriceTicker } from "../components/EthPriceTicker";
import { LiquidityPoolCard } from "../components/dashboard/LiquidityPoolCard";
import { ContractAddressCard } from "../components/dashboard/ContractAddressCard";
import { formatValue } from "../utils/format";
import type { Token } from "../config/types";

export const HomePage = () => {
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

  const selectedTokenAddr = useMemo(
    () => supportedTokens[0]?.address || "0x0000000000000000000000000000000000000000",
    [supportedTokens]
  );

  const currentTokenConfig = useMemo(
    () => supportedTokens.find((t) => t.address === selectedTokenAddr) || supportedTokens[0],
    [selectedTokenAddr, supportedTokens]
  );

  const { data: poolData, isLoading: isPoolLoading } = useReadContract({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_BASE_ABI,
    functionName: "pools",
    args: [selectedTokenAddr],
  });

  const ethReserve = poolData ? poolData[0] : undefined;
  const tokenReserve = poolData ? poolData[1] : undefined;
  const totalLiquidityRaw = poolData ? poolData[2] : undefined;

  const displayReserveETH = formatValue(ethReserve, 18);
  const displayReserveToken = formatValue(tokenReserve, 18); 
  const displayTotalLiquidity = formatValue(totalLiquidityRaw, 18);

  const activeSymbol = currentTokenConfig?.symbol ?? "TOKEN";

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-purple-neon" />,
      title: "Быстрые свапы",
      description: "Обменивайте токены за секунды благодаря гибридной архитектуре AMM + Contract Listeners",
    },
    {
      icon: <Shield className="w-6 h-6 text-crimson-neon" />,
      title: "Безопасность",
      description: "Смарт-контракты проходят аудит, средства полностью под вашим контролем.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-neon" />,
      title: "Прозрачная ликвидность",
      description: "Все резервы публичны, любой может стать поставщиком ликвидности.",
    },
    {
      icon: <Lock className="w-6 h-6 text-crimson-neon" />,
      title: "Некастодиально",
      description: "Вы сохраняете полное владение активами на своём кошельке.",
    },
  ];

  const steps = [
    { number: "01", title: "Подключите кошелёк", desc: "MetaMask, WalletConnect или любой другой Web3-кошелёк." },
    { number: "02", title: "Выберите токены", desc: "Укажите пару для обмена или добавления ликвидности." },
    { number: "03", title: "Подтвердите транзакцию", desc: "Все операции выполняются в сети Sepolia (тестнет)." },
  ];

  return (
    <div className="space-y-24 pb-20 animate-fade-in">
      <section className="relative pt-20 md:pt-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-neon/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-crimson-neon/5 rounded-full blur-[100px] -z-10" />

        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-mono text-gray-300 tracking-wider">Sepolia Testnet</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
            <span className="text-white">Ru.</span>
            <span className="text-purple-neon">HEX</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-2xl mx-auto">
            Гибридная децентрализованная биржа на базе Ethereum. Обменивайте токены, предоставляйте ликвидность и зарабатывайте{"(пока что тестовые токены, эх)"}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <ConnectKitButton.Custom>
              {({ show, isConnected }) => (
                <button
                  onClick={show}
                  className="group relative px-8 py-4 bg-purple-neon text-black font-bold uppercase tracking-wider transition-all duration-300 hover:bg-crimson-neon hover:text-white rounded-sm skew-x-[-10deg] shadow-neon-purple hover:shadow-neon-red"
                >
                  <span className="skew-x-[10deg] flex items-center gap-2">
                    {isConnected ? "Открыть инфо о кошельке" : "Подключить кошелёк"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              )}
            </ConnectKitButton.Custom>

            <a
              href="/dashboard"
              className="px-8 py-4 border border-white/10 bg-white/5 text-white font-bold uppercase tracking-wider hover:border-purple-neon/50 transition-all rounded-sm skew-x-[-10deg]"
            >
              <span className="skew-x-[10deg]">Перейти в дашборд</span>
            </a>
          </div>

          <div className="flex justify-center">
            <EthPriceTicker />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center uppercase tracking-tighter mb-12">
          <span className="text-white">Почему</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-neon to-crimson-neon">
            Ru.HEX
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 text-center hover:border-purple-500/30 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-dark/30 border border-white/5 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center uppercase tracking-tighter mb-12">
          Как это <span className="text-crimson-neon">работает</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="text-6xl font-black text-purple-neon/20 mb-4">{step.number}</div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center uppercase tracking-tighter mb-12">
          Текущее состояние <span className="text-purple-neon">пула</span>
        </h2>

        <div className="flex justify-center">
          <LiquidityPoolCard
            activeSymbol={activeSymbol}
            ethReserve={displayReserveETH}
            tokenReserve={displayReserveToken}
            totalLiquidity={displayTotalLiquidity}
            isLoading={isPoolLoading || isLoadingTokens}
            isSymbolLoading={isLoadingTokens}
          />
          <ContractAddressCard
            exchangeAddress={EXCHANGE_CONTRACT_ADDRESS}
            tokenAddress={selectedTokenAddr}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-mono">
            * Данные обновляются в реальном времени при каждом запросе к rpc.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface to-background p-12 md:p-16 text-center max-w-4xl mx-auto">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-neon/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-crimson-neon/10 rounded-full blur-[100px] pointer-events-none" />

        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
          Готовы начать?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Подключите кошелёк и начните обменивать токены
        </p>

        <ConnectKitButton.Custom>
          {({ show }) => (
            <button
              onClick={show}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black hover:bg-purple-neon hover:text-white font-bold uppercase tracking-wider transition-all duration-300 rounded-sm skew-x-[-10deg]"
            >
              <span className="skew-x-[10deg] flex items-center gap-2">
                Подключить кошелёк
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          )}
        </ConnectKitButton.Custom>
      </section>
    </div>
  );
};