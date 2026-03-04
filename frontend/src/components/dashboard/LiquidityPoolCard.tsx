import { Database } from "lucide-react";
import { Card } from "../Card";
import { StatRow } from "../StatRow";

interface LiquidityPoolCardProps {
  activeSymbol: string;
  ethReserve: string | null;
  tokenReserve: string | null;
  totalLiquidity: string | null;
  isLoading: boolean;
  isSymbolLoading?: boolean;
  ethPriceInTokens?: bigint;
  tokenPriceInETH?: bigint;
}

export const LiquidityPoolCard = ({
  activeSymbol,
  ethReserve,
  tokenReserve,
  totalLiquidity,
  isLoading,
  isSymbolLoading = false,
  ethPriceInTokens,
  tokenPriceInETH,
}: LiquidityPoolCardProps) => {
  const displayEthPrice = ethPriceInTokens
    ? (Number(ethPriceInTokens) / 1e18).toFixed(6)
    : "0";
  const displayTokenPrice = tokenPriceInETH
    ? (Number(tokenPriceInETH) / 1e18).toFixed(6)
    : "0";

  return (
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
          value={ethReserve || "0"}
          unit="ETH"
          isLoading={isLoading}
        />
        <StatRow
          label={`Pooled ${activeSymbol}`}
          value={tokenReserve || "0"}
          unit={activeSymbol}
          isLoading={isLoading || isSymbolLoading}
        />
        <div className="mt-2 pt-2 border-t border-white/5">
          <StatRow
            label="1 ETH Price"
            value={displayEthPrice}
            unit={activeSymbol}
            isLoading={isLoading}
          />
          <StatRow
            label={`1 ${activeSymbol} Price`}
            value={displayTokenPrice}
            unit="ETH"
            isLoading={isLoading}
          />
        </div>
        <div className="mt-2">
          <StatRow
            label="Total Liquidity In Tokens"
            value={totalLiquidity || "0"}
            unit="LP"
            highlight
            isLoading={isLoading}
          />
        </div>
      </div>
    </Card>
  );
};