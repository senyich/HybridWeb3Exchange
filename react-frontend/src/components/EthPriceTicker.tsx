import { useEffect, useRef, useState } from "react";
import { getEthPrice } from "../api";
import { Skeleton } from "./Skeleton";

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
      // Assuming getEthPrice returns a number
      const usd = await getEthPrice("usd");

      if (usd !== null && prevUsdRef.current !== null) {
        if (usd > prevUsdRef.current) setDirection("up");
        else if (usd < prevUsdRef.current) setDirection("down");
        else setDirection("same");
      }

      prevUsdRef.current = usd;
      setPrices({ usd });
    } catch (e) {
      console.error("Failed to fetch price", e);
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
      ? "drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]"
      : direction === "down"
      ? "drop-shadow-[0_0_12px_rgba(255,0,60,0.6)]"
      : "drop-shadow-[0_0_10px_rgba(176,38,255,0.3)]";

  return (
    <div className="rounded-xl bg-surface/40 backdrop-blur-md border border-white/10 px-5 py-3 flex items-center gap-6 shadow-lg hover:bg-surface/60 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-neon animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-purple-neon animate-ping opacity-75" />
        </div>
        <span className="text-gray-400 font-mono text-xs uppercase tracking-widest font-bold">
          ETH/USD
        </span>
      </div>

      <div className="h-8 w-[1px] bg-white/10" />

      {loading ? (
        <Skeleton className="w-24 h-8" />
      ) : (
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-mono font-bold transition-all duration-500 ${priceColor} ${glow}`}
          >
            ${prices.usd?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>

          {direction !== "same" && (
            <span
              className={`text-lg animate-fade-in ${
                direction === "up" ? "text-emerald-400" : "text-crimson-neon"
              }`}
            >
              {direction === "up" ? "↗" : "↘"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}