import { useEffect, useState, useRef, memo, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  market_cap: number;
}

const FALLBACK: CoinData[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 67500, price_change_percentage_24h: -1.98, image: "", market_cap: 1352000000000 },
  { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 1963, price_change_percentage_24h: -3.02, image: "", market_cap: 237000000000 },
  { id: "ripple", symbol: "xrp", name: "XRP", current_price: 1.38, price_change_percentage_24h: -2.72, image: "", market_cap: 84000000000 },
];

const formatPrice = (price: number) => {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
};

const formatMarketCap = (cap: number) => {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  return `$${(cap / 1e6).toFixed(0)}M`;
};

type PriceDirection = "up" | "down" | null;

const CoinCard = memo(({ coin, flash }: { coin: CoinData; flash: PriceDirection }) => {
  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <div className={cn(
      "p-5 sm:p-6 rounded-2xl bg-card border border-border/60 relative overflow-hidden",
      "hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    )}>
      {/* Flash overlay on price change */}
      {flash && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none rounded-2xl animate-[flash_0.8s_ease-out_forwards]",
            flash === "up" ? "bg-green-500/10" : "bg-red-500/10"
          )}
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        {coin.image ? (
          <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" loading="lazy" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary uppercase">{coin.symbol}</span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-foreground">{coin.name}</h3>
          <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={cn(
            "text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-500",
            flash === "up" ? "text-green-500" : flash === "down" ? "text-red-500" : "text-foreground"
          )}>
            {formatPrice(coin.current_price)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            MCap: {formatMarketCap(coin.market_cap)}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium",
          isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </div>
      </div>
    </div>
  );
});

CoinCard.displayName = "CoinCard";

export const LiveMarketPrices = memo(() => {
  const [coins, setCoins] = useState<CoinData[]>(FALLBACK);
  const [flashes, setFlashes] = useState<Record<string, PriceDirection>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const prevPrices = useRef<Record<string, number>>({});

  const fetchPrices = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple&order=market_cap_desc&sparkline=false",
        { headers: { Accept: "application/json" }, signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const newCoins = data.map((d: any) => ({
          id: d.id,
          symbol: d.symbol,
          name: d.name,
          current_price: d.current_price,
          price_change_percentage_24h: d.price_change_percentage_24h,
          image: d.image,
          market_cap: d.market_cap,
        }));

        // Determine flash directions
        const newFlashes: Record<string, PriceDirection> = {};
        newCoins.forEach((coin: CoinData) => {
          const prev = prevPrices.current[coin.id];
          if (prev !== undefined && prev !== coin.current_price) {
            newFlashes[coin.id] = coin.current_price > prev ? "up" : "down";
          }
        });

        // Store current prices for next comparison
        newCoins.forEach((coin: CoinData) => {
          prevPrices.current[coin.id] = coin.current_price;
        });

        setFlashes(newFlashes);
        setCoins(newCoins);
        setLastUpdated(new Date());

        // Clear flashes after animation
        if (Object.keys(newFlashes).length > 0) {
          setTimeout(() => setFlashes({}), 1200);
        }
      }
    } catch {
      // Use fallback
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <section className="py-14 sm:py-20" aria-labelledby="market-prices-title">
      <style>{`
        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6">
        <header className="text-center mb-10">
          <h2 id="market-prices-title" className="text-3xl sm:text-4xl font-bold mb-3">
            Live Market Prices
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <RefreshCw className="w-3.5 h-3.5 animate-[spin_3s_linear_infinite]" />
            <span>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Fetching live prices…"}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {coins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} flash={flashes[coin.id] || null} />
          ))}
        </div>
      </div>
    </section>
  );
});

LiveMarketPrices.displayName = "LiveMarketPrices";
