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
  
  return { id, type, amount: amounts[type], user: `User***${Math.floor(Math.random() * 900 + 100)}` };
};

const TradeCard = memo(({ trade }: { trade: TradeNotification }) => {
  const config = {
    profit: { 
      icon: TrendingUp, 
      message: `earned +$${trade.amount.toLocaleString()}`,
      color: 'text-success',
      bg: 'bg-success/8 border-success/15'
    },
    withdrawal: { 
      icon: ArrowUpRight, 
      message: `withdrew $${trade.amount.toLocaleString()}`,
      color: 'text-primary',
      bg: 'bg-primary/8 border-primary/15'
    },
    trade: { 
      icon: DollarSign, 
      message: `placed $${trade.amount.toLocaleString()} trade`,
      color: 'text-accent',
      bg: 'bg-accent/8 border-accent/15'
    },
  };

  const { icon: Icon, message, color, bg } = config[trade.type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-sm",
        bg
      )}
      role="listitem"
    >
      <div className={cn("p-2 rounded-full", bg)}>
        <Icon className={cn("w-4 h-4", color)} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          <span className="opacity-70">{trade.user}</span>{" "}
          <span className={color}>{message}</span>
        </p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" aria-hidden="true" />
    </motion.div>
  );
});

TradeCard.displayName = "TradeCard";

const StatCard = memo(({ value, label, color }: { value: string; label: string; color: string }) => (
  <div className="text-center p-4 sm:p-6 rounded-xl bg-card/50 border border-border/40">
    <div className={cn("text-2xl sm:text-3xl font-bold mb-1", color)}>
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
    const initialTrades = Array.from({ length: 3 }, (_, i) => generateTrade(i));
    setTrades(initialTrades);
    const interval = setInterval(addNewTrade, 4000);
    return () => clearInterval(interval);
  }, [addNewTrade]);

  return (
    <section 
      className="py-16 sm:py-24"
      aria-labelledby="live-trading-title"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success">Live Activity</span>
          </div>
          <h2 id="live-trading-title" className="text-3xl sm:text-4xl font-bold mb-3">
            Real-Time Trading
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
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
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto"
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
