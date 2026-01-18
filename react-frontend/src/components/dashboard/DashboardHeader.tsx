import { Activity } from "lucide-react";
import { TokenSelector } from "./TokenSelector";
import type { Token } from "../../config/types";

interface DashboardHeaderProps {
  selectedTokenAddr: `0x${string}`;
  supportedTokens: Token[];
  isLoadingTokens: boolean;
  onTokenChange: (address: `0x${string}`) => void;
}

export const DashboardHeader = ({
  selectedTokenAddr,
  supportedTokens,
  isLoadingTokens,
  onTokenChange,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
      <div className="flex flex-col gap-3 w-full md:w-auto">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
          Dashboard
        </h1>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-purple-300/70 bg-purple-900/10 px-3 py-1.5 rounded-full border border-purple-500/10 w-fit">
          <Activity className="w-3 h-3 text-green-400 animate-pulse" />
          <span>NETWORK: SEPOLIA ACTIVE</span>
        </div>
      </div>

      <div className="w-full md:w-auto">
        <TokenSelector
          selectedTokenAddr={selectedTokenAddr}
          supportedTokens={supportedTokens}
          isLoadingTokens={isLoadingTokens}
          onTokenChange={onTokenChange}
        />
      </div>
    </div>
  );
};