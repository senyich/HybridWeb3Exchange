import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import type { Token } from "../../config/types";

interface TokenSelectorProps {
  isEth: boolean;
  selected: string;
  onSelect: (val: string) => void;
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setLocalSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedToken = useMemo(
    () => supportedTokens.find((t) => t.address === selected),
    [selected, supportedTokens]
  );

  const filteredTokens = useMemo(() => {
    if (!localSearchQuery) return supportedTokens;
    return supportedTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
  }, [supportedTokens, localSearchQuery]);

  const handleTokenSelect = (tokenAddress: string) => {
    onSelect(tokenAddress);
    setIsDropdownOpen(false);
    setLocalSearchQuery("");
  };

  if (isEth) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 pl-3 pr-4 py-2.5 rounded-2xl shadow-glass shadow-lg cursor-default">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center border-2 border-white/30">
            <span className="text-xs font-black text-white">Ξ</span>
          </div>
          <div className="absolute -inset-1 rounded-full bg-cyan-500/20 blur-md -z-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white tracking-tight">
            ETH
          </span>
          <span className="text-xs text-slate-400">Ethereum</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsDropdownOpen(true)}
        disabled={disabled}
        className={`flex items-center gap-3 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 pl-3 pr-4 py-2.5 rounded-2xl shadow-glass shadow-lg transition-all duration-300 group min-w-[180px] ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-neon-purple/20 cursor-pointer"
        }`}
      >
        {isLoadingTokens ? (
          <Loader2 className="w-5 h-5 animate-spin text-purple-electric mx-2" />
        ) : (
          <>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-neon to-purple-deep flex items-center justify-center border-2 border-white/30">
                <span className="text-xs font-bold text-white">
                  {selectedToken?.symbol?.[0] || "T"}
                </span>
              </div>
              <div className="absolute -inset-1 rounded-full bg-purple-neon/20 blur-md -z-10" />
            </div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-lg font-bold text-white tracking-tight truncate w-full">
                {selectedToken?.symbol || "SELECT"}
              </span>
              <span className="text-xs text-slate-400 truncate w-full">
                {selectedToken?.name || "Select Token"}
              </span>
            </div>
            {!disabled && (
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </>
        )}
      </button>

      {isDropdownOpen && !isLoadingTokens && !disabled && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-gradient-to-b from-surface/95 to-surface/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search token..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-neon/50 transition-colors"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleTokenSelect(token.address)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-neon/50 to-purple-deep/50 flex items-center justify-center border border-white/20">
                    <span className="text-xs font-bold text-white">
                      {token.symbol[0]}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-white group-hover:text-purple-electric transition-colors">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {token.name}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}