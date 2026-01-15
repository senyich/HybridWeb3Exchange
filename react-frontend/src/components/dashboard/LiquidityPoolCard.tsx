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
}

export const LiquidityPoolCard = ({
  activeSymbol,
  ethReserve,
  tokenReserve,
  totalLiquidity,
  isLoading,
  isSymbolLoading = false,
}: LiquidityPoolCardProps) => {
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