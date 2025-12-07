import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
interface MarketData {
  total_market_cap: number;
  total_volume: number;
  market_cap_change_percentage_24h: number;
}
export const MarketStats = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const {
    ref,
    isVisible
  } = useScrollAnimation(0.2);
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        const data = await response.json();
        setMarketData({
          total_market_cap: data.data.total_market_cap.usd,
          total_volume: data.data.total_volume.usd,
          market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd
        });
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);
  const marketCap = useCountUp(marketData ? Math.floor(marketData.total_market_cap / 1e9) : 0, 2000, 0, isVisible);
  const volume = useCountUp(marketData ? Math.floor(marketData.total_volume / 1e9) : 0, 2000, 0, isVisible);
  return <section ref={ref} className="py-16 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground font-serif">
            Live Market Overview
          </h2>
          <p className="text-foreground/70 font-serif text-justify">Real-time cryptocurrency market data</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className={`glass-card p-6 rounded-xl hover-lift animate-optimized transition-all duration-300 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              {marketData && <span className={`text-sm font-medium ${marketData.market_cap_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketData.market_cap_change_percentage_24h >= 0 ? '+' : ''}
                  {marketData.market_cap_change_percentage_24h.toFixed(2)}%
                </span>}
            </div>
            <h3 className="text-sm text-muted-foreground mb-2">Global Market Cap</h3>
            <p className="text-3xl font-bold text-yellow-400">
              ${marketCap}B+
            </p>
          </div>

          <div className={`glass-card p-6 rounded-xl hover-lift animate-optimized transition-all duration-300 [transition-delay:100ms] group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors duration-200">
                <Activity className="w-6 h-6 text-accent" />
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground mb-2">24h Trading Volume</h3>
            <p className="text-3xl font-bold text-yellow-400">
              ${volume}B+
            </p>
          </div>

          <div className={`glass-card p-6 rounded-xl hover-lift animate-optimized transition-all duration-300 [transition-delay:200ms] group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground mb-2">Active Markets</h3>
            <p className="text-3xl font-bold text-yellow-400">10,000+</p>
          </div>
        </div>
      </div>
    </section>;
};