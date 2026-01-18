import { ChevronDown, Layers } from "lucide-react";
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
    <div className="relative group w-full md:w-72">
      <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 pl-1">
        <Layers className="w-3 h-3" />
        Select Asset
      </label>
      <div className="relative">
        <select
          value={selectedTokenAddr}
          onChange={(e) => onTokenChange(e.target.value as `0x${string}`)}
          disabled={isLoadingTokens || supportedTokens.length === 0}
          className="w-full appearance-none bg-surface/50 backdrop-blur-md border border-white/10 text-white font-mono text-sm py-3.5 pl-4 pr-12 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer hover:bg-white/5 hover:border-white/20 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed truncate"
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none p-1 bg-white/5 rounded">
           <ChevronDown className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};