import { useEffect, useState, useCallback, useRef, memo } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface MarketData {
  total_market_cap: number;
  total_volume: number;
  market_cap_change_percentage_24h: number;
}

// Fallback data to show immediately
const FALLBACK_MARKET_DATA: MarketData = {
  total_market_cap: 2450000000000, // ~2.45T
  total_volume: 85000000000, // ~85B
  market_cap_change_percentage_24h: 1.5,
};

export const MarketStats = memo(() => {
  // Start with fallback data to prevent loading state
  const [marketData, setMarketData] = useState<MarketData>(FALLBACK_MARKET_DATA);
  const { ref, isVisible } = useScrollAnimation(0.2);
  const fetchedRef = useRef(false);

  const fetchMarketData = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.coingecko.com/api/v3/global', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      setMarketData({
        total_market_cap: data.data.total_market_cap.usd,
        total_volume: data.data.total_volume.usd,
        market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd
      });
      fetchedRef.current = true;
    } catch (error) {
      // Silently fail - we already have fallback data
      console.error('Failed to fetch market data:', error);
    }
  }, []);

  useEffect(() => {
    // Delay fetch to prioritize initial render
    const timeoutId = setTimeout(fetchMarketData, 200);
    const interval = setInterval(fetchMarketData, 300000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [fetchMarketData]);

  const marketCap = useCountUp(Math.floor(marketData.total_market_cap / 1e9), 2000, 0, isVisible);
  const volume = useCountUp(Math.floor(marketData.total_volume / 1e9), 2000, 0, isVisible);
  const isPositive = marketData.market_cap_change_percentage_24h >= 0;

  const stats = [
    {
      icon: DollarSign,
      label: 'Global Market Cap',
      value: `$${marketCap}B+`,
      change: `${isPositive ? '+' : ''}${marketData.market_cap_change_percentage_24h.toFixed(2)}%`,
      isPositive,
    },
    {
      icon: Activity,
      label: '24h Trading Volume',
      value: `$${volume}B+`,
      change: null,
      isPositive: true,
    },
    {
      icon: BarChart3,
      label: 'Active Markets',
      value: '10,000+',
      change: null,
      isPositive: true,
    },
  ];

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Live Market Overview</h2>
          <p className="text-muted-foreground text-lg">Real-time cryptocurrency market data</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-success' : 'text-destructive'}`}>
                      {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

MarketStats.displayName = "MarketStats";
