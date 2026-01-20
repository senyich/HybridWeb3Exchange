import { User } from "lucide-react";
import { Card } from "../Card";
import { StatRow } from "../StatRow";

interface UserInfoCardProps {
  isConnected: boolean;
  activeSymbol: string;
  ethBalance: string | null;
  tokenBalance: string | null;
  userLiquidity: string | null;
  isEthLoading: boolean;
  isTokenLoading: boolean;
  isLiquidityLoading: boolean;
}

export const UserInfoCard = ({
  isConnected,
  activeSymbol,
  ethBalance,
  tokenBalance,
  userLiquidity,
  isEthLoading,
  isTokenLoading,
  isLiquidityLoading,
}: UserInfoCardProps) => {
  return (
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
            value={ethBalance || "0"}
            unit="ETH"
            isLoading={isEthLoading}
          />
          <StatRow
            label={`Your ${activeSymbol} Share`}
            value={tokenBalance || "0"}
            unit={activeSymbol}
            isLoading={isTokenLoading}
          />
          <div className="mt-4 pt-4 border-t border-dashed border-white/10">
            <StatRow
              label="Your LP Tokens"
              value={userLiquidity || "0"}
              unit="LP"
              highlight
              isLoading={isLiquidityLoading}
            />
          </div>
        </div>
      )}
    </Card>
  );
};