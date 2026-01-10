import { useEffect, useState, memo, useCallback } from "react";
import { TrendingUp, ArrowUpRight, DollarSign, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TradeNotification {
  id: number;
  type: 'profit' | 'withdrawal' | 'trade';
  amount: number;
  user: string;
}

const generateTrade = (id: number): TradeNotification => {
  const types: TradeNotification['type'][] = ['profit', 'withdrawal', 'trade'];
  const type = types[Math.floor(Math.random() * types.length)];
  const amounts = {
    profit: 50 + Math.floor(Math.random() * 2000),
    withdrawal: 500 + Math.floor(Math.random() * 5000),
    trade: 100 + Math.floor(Math.random() * 3000),
  };
  
  return {
    id,
    type,
    amount: amounts[type],
    user: `User***${Math.floor(Math.random() * 900 + 100)}`,
  };
};

const TradeCard = memo(({ trade }: { trade: TradeNotification }) => {
  const config = {
    profit: { 
      icon: TrendingUp, 
      message: `earned +$${trade.amount.toLocaleString()}`,
      color: 'text-success bg-success/10 border-success/20'
    },
    withdrawal: { 
      icon: ArrowUpRight, 
      message: `withdrew $${trade.amount.toLocaleString()}`,
      color: 'text-primary bg-primary/10 border-primary/20'
    },
    trade: { 
      icon: DollarSign, 
      message: `placed $${trade.amount.toLocaleString()} trade`,
      color: 'text-accent bg-accent/10 border-accent/20'
    },
  };

  const { icon: Icon, message, color } = config[trade.type];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.3 
      }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm",
        color
      )}
      role="listitem"
    >
      <div className="p-2 rounded-full bg-current/10">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          <span className="opacity-70">{trade.user}</span> {message}
        </p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" aria-hidden="true" />
    </motion.div>
  );
});

TradeCard.displayName = "TradeCard";

const StatCard = memo(({ value, label, color }: { value: string; label: string; color: string }) => (
  <div className="text-center group">
    <div 
      className={cn(
        "text-2xl sm:text-3xl font-bold mb-1 transition-transform duration-300",
        "group-hover:scale-105",
        color
      )}
    >
      {value}
    </div>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
));

StatCard.displayName = "StatCard";

export const LiveTradingFeed = memo(() => {
  const [trades, setTrades] = useState<TradeNotification[]>([]);

  const addNewTrade = useCallback(() => {
    setTrades(prev => {
      const newTrade = generateTrade(Date.now());
      return [newTrade, ...prev.slice(0, 4)];
    });
  }, []);

  useEffect(() => {
    // Initialize with trades
    const initialTrades = Array.from({ length: 3 }, (_, i) => generateTrade(i));
    setTrades(initialTrades);

    const interval = setInterval(addNewTrade, 4000);
    return () => clearInterval(interval);
  }, [addNewTrade]);

  return (
    <section 
      className="py-16 sm:py-20"
      aria-labelledby="live-trading-title"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success">Live Activity</span>
          </div>
          <h2 id="live-trading-title" className="text-3xl sm:text-4xl font-bold mb-3">
            Real-Time Trading
          </h2>
          <p className="text-muted-foreground text-lg">
            Watch our traders profit in real-time
          </p>
        </header>

        <div 
          className="max-w-xl mx-auto space-y-3"
          role="list"
          aria-label="Recent trading activity"
        >
          <AnimatePresence mode="popLayout">
            {trades.slice(0, 5).map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div 
          className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-12 pt-8 border-t border-border"
          role="region"
          aria-label="Trading statistics"
        >
          <StatCard value="$12.5M+" label="Profits Today" color="text-success" />
          <StatCard value="2,847" label="Active Trades" color="text-primary" />
          <StatCard value="99.2%" label="Success Rate" color="text-accent" />
        </div>
      </div>
    </section>
  );
});

LiveTradingFeed.displayName = "LiveTradingFeed";
