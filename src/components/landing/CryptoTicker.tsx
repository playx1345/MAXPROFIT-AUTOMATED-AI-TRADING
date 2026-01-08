import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoPrice {
  id: string;
  symbol: string;
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
    const interval = setInterval(fetchCryptoPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-muted/30 border-y border-border/50 py-4 overflow-hidden">
        <div className="animate-pulse flex space-x-8 px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 min-w-[180px]">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const duplicatedCryptos = [...cryptos, ...cryptos];

  return (
    <div className="bg-muted/30 border-y border-border/50 py-4 overflow-hidden">
      <div className="flex animate-scroll-left">
        {duplicatedCryptos.map((crypto, index) => {
          const isPositive = crypto.price_change_percentage_24h >= 0;
          return (
            <div key={`${crypto.id}-${index}`} className="flex items-center gap-3 px-6 min-w-[220px]">
              <span className="font-bold text-sm uppercase tracking-wider text-primary">
                {crypto.symbol}
              </span>
              <span className="font-semibold text-foreground">
                ${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center text-xs font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
