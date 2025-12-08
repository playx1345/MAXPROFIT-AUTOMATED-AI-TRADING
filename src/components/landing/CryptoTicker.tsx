import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const CryptoTicker = () => {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin&order=market_cap_desc&sparkline=false'
        );
        const data = await response.json();
        setCryptos(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch crypto prices:', error);
        setIsLoading(false);
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-muted/50 border-y border-border py-4 overflow-hidden">
        <div className="animate-pulse flex space-x-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2 min-w-[200px]">
              <div className="h-4 w-4 bg-muted-foreground/20 rounded-full" />
              <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const duplicatedCryptos = [...cryptos, ...cryptos];

  return (
    <div className="bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 border-y border-border/50 py-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-shimmer" />
      <div className="relative flex animate-scroll-left animate-optimized">
        {duplicatedCryptos.map((crypto, index) => (
          <div
            key={`${crypto.id}-${index}`}
            className="flex items-center space-x-3 px-6 min-w-[250px] group"
          >
            <span className="font-bold text-sm uppercase tracking-wider text-gradient">
              {crypto.symbol}
            </span>
            <span className="font-semibold text-foreground">
              ${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`flex items-center text-xs font-medium ${
                crypto.price_change_percentage_24h >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {crypto.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
