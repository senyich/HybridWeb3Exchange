import { ChevronDown } from "lucide-react";
import type { Token } from "../../config/types";

interface TokenSelectorProps {
  selectedTokenAddr: `0x${string}`;
  supportedTokens: Token[];
  isLoadingTokens: boolean;
  onTokenChange: (address: `0x${string}`) => void;
}

export const TokenSelector = ({
  selectedTokenAddr,
  supportedTokens,
  isLoadingTokens,
  onTokenChange,
}: TokenSelectorProps) => {
  return (
    <div className="relative group w-full md:w-64">
      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block pl-1">
        Active tokens
      </label>
      <div className="relative">
        <select
          value={selectedTokenAddr}
          onChange={(e) => onTokenChange(e.target.value as `0x${string}`)}
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
  );
};
