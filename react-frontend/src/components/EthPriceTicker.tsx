import { useEffect, useRef, useState } from "react";
import { getEthPrice } from "../api";

type Prices = {
  usd: number | null;
};

type Direction = "up" | "down" | "same";

const REFRESH_INTERVAL = 10_000;

export function EthPriceTicker() {
  const [prices, setPrices] = useState<Prices>({ usd: null });
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<Direction>("same");

  const prevUsdRef = useRef<number | null>(null);

  const fetchPrices = async () => {
    try {
      const [usd] = await Promise.all([getEthPrice("usd")]);

      if (usd !== null && prevUsdRef.current !== null) {
        if (usd > prevUsdRef.current) setDirection("up");
        else if (usd < prevUsdRef.current) setDirection("down");
        else setDirection("same");
      }

      prevUsdRef.current = usd;
      setPrices({ usd });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const priceColor =
    direction === "up"
      ? "text-emerald-400"
      : direction === "down"
      ? "text-crimson-neon"
      : "text-white";

  const glow =
    direction === "up"
      ? "drop-shadow-[0_0_16px_rgba(52,211,153,0.5)]"
      : direction === "down"
      ? "drop-shadow-[0_0_16px_rgba(255,0,60,0.5)]"
      : "drop-shadow-[0_0_14px_rgba(176,38,255,0.4)]";

  return (
    <div className="rounded-2xl bg-surface/70 backdrop-blur-xl border border-purple-deep/40 shadow-glass px-8 py-6 flex items-center gap-8">
      <div className="flex items-center gap-3">
        <span className="text-purple-neon font-mono text-base tracking-widest">
          ETH rate
        </span>
        <span className="w-3 h-3 rounded-full bg-purple-neon animate-pulse shadow-neon-purple" />
      </div>

      {loading ? (
        <span className="text-white/60 text-base animate-pulse">
          Loading price…
        </span>
      ) : (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-3">
            <span
              className={`text-3xl font-semibold transition-colors duration-300 ${priceColor} ${glow}`}
            >
              ${prices.usd?.toLocaleString("en-US")}
            </span>

            {direction !== "same" && (
              <span
                className={`text-xl ${
                  direction === "up" ? "text-emerald-400" : "text-crimson-neon"
                }`}
              >
                {direction === "up" ? "▲" : "▼"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
