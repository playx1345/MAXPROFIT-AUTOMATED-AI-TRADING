import { useEffect, useState, memo, useCallback, useRef } from "react";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

// Fallback data when API fails
const FALLBACK_DATA: CryptoPrice[] = [
  { id: "bitcoin", symbol: "btc", current_price: 67500, price_change_percentage_24h: 2.5 },
  { id: "ethereum", symbol: "eth", current_price: 3450, price_change_percentage_24h: 1.8 },
  { id: "tether", symbol: "usdt", current_price: 1.00, price_change_percentage_24h: 0.01 },
  { id: "binancecoin", symbol: "bnb", current_price: 580, price_change_percentage_24h: -0.5 },
  { id: "solana", symbol: "sol", current_price: 145, price_change_percentage_24h: 3.2 },
  { id: "ripple", symbol: "xrp", current_price: 0.52, price_change_percentage_24h: -1.2 },
];

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const CryptoItem = memo(({ crypto, index }: { crypto: CryptoPrice; index: number }) => {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  
  return (
    <div 
      className="flex items-center gap-3 px-6 min-w-[220px]"
      role="listitem"
      aria-label={`${crypto.symbol.toUpperCase()}: $${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, ${isPositive ? 'up' : 'down'} ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%`}
    >
      <span className="font-bold text-sm uppercase tracking-wider text-primary">
        {crypto.symbol}
      </span>
      <span className="font-semibold text-foreground tabular-nums">
        ${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span 
        className={cn(
          "flex items-center text-xs font-medium tabular-nums",
          isPositive ? "text-success" : "text-destructive"
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-1" aria-hidden="true" />
        )}
        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
      </span>
    </div>
  );
});

CryptoItem.displayName = "CryptoItem";

export const CryptoTicker = memo(() => {
  // Start with fallback data immediately to prevent loading state from blocking render
  const [cryptos, setCryptos] = useState<CryptoPrice[]>(FALLBACK_DATA);
  const [isLoading, setIsLoading] = useState(false); // Start as false since we have fallback data
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);

  const fetchCryptoPrices = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin&order=market_cap_desc&sparkline=false',
        {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setCryptos(data);
        setError(null);
        retryCountRef.current = 0;
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      // Silently fail - we already have fallback data showing
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        // Non-blocking retry in background
        setTimeout(fetchCryptoPrices, RETRY_DELAY * Math.pow(2, retryCountRef.current));
      } else {
        setError('Using cached data');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch in background without blocking render
    const timeoutId = setTimeout(fetchCryptoPrices, 100); // Small delay to prioritize initial render
    const interval = setInterval(fetchCryptoPrices, 60000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [fetchCryptoPrices]);

  // No loading state - we always have data (fallback or real)

  const displayCryptos = cryptos.length > 0 ? cryptos : FALLBACK_DATA;
  const duplicatedCryptos = [...displayCryptos, ...displayCryptos];

  return (
    <div 
      className="bg-muted/30 border-y border-border/50 py-4 overflow-hidden relative"
      role="list"
      aria-label="Cryptocurrency prices ticker"
    >
      {error && (
        <div className="absolute top-1 right-2 flex items-center gap-1 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" aria-hidden="true" />
          <span className="sr-only">{error}</span>
        </div>
      )}
      <div 
        className={cn(
          "flex animate-scroll-left",
          "motion-reduce:animate-none motion-reduce:overflow-x-auto"
        )}
      >
        {duplicatedCryptos.map((crypto, index) => (
          <CryptoItem 
            key={`${crypto.id}-${index}`} 
            crypto={crypto} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
});

CryptoTicker.displayName = "CryptoTicker";
