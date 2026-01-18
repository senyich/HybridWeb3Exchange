import { useEffect, useRef, useState } from "react";
import { getEthPrice } from "../utils/api";
import { TrendingUp, TrendingDown } from "lucide-react";

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
      const usd = await getEthPrice();
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

  const getStatusColor = () => {
    if (loading) return "text-gray-500";
    if (direction === "up") return "text-green-400";
    if (direction === "down") return "text-red-400";
    return "text-purple-300";
  };

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
      <div className="flex items-center gap-2">
         <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${direction === 'down' ? 'bg-red-500' : 'bg-green-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${direction === 'down' ? 'bg-red-500' : 'bg-green-500'}`}></span>
         </div>
         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ETH/USD</span>
      </div>
      <div className="w-[1px] h-3 bg-white/10" />

      <div className={`flex items-center gap-1 font-mono text-sm font-bold ${getStatusColor()}`}>
        {loading ? (
           <span className="animate-pulse">Loading...</span>
        ) : (
           <>
              ${prices.usd?.toFixed(2)}
              {direction === "up" && <TrendingUp className="w-3 h-3" />}
              {direction === "down" && <TrendingDown className="w-3 h-3" />}
           </>
        )}
      </div>
    </div>
  );
}