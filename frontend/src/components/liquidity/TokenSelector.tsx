import { ChevronDown } from "lucide-react";
import type { Token } from "../../config/types";

interface TokenSelectorProps {
  isEth: boolean;
  selected: `0x${string}`;
  onSelect: (value: `0x${string}`) => void;
  supportedTokens: Token[];
  isLoadingTokens: boolean;
  disabled?: boolean;
}

export function TokenSelector({
  isEth,
  selected,
  onSelect,
  supportedTokens,
  isLoadingTokens,
  disabled = false,
}: TokenSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value as `0x${string}`);
  };

  return (
    <div className="relative">
      {isEth ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#2B2B36] rounded-xl border border-white/10 min-w-[120px]">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
            Ξ
          </div>
          <span className="text-white font-semibold text-sm">ETH</span>
        </div>
      ) : (
        <div className="relative">
          <select
            value={selected}
            onChange={handleChange}
            disabled={disabled || isLoadingTokens}
            className="appearance-none flex items-center gap-2 px-3 py-2 bg-[#2B2B36] rounded-xl border border-white/10 text-white font-semibold text-sm pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#353542] transition-colors outline-none focus:border-purple-neon/50"
          >
            {isLoadingTokens ? (
              <option>Loading...</option>
            ) : (
              supportedTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      )}
    </div>
  );
}
