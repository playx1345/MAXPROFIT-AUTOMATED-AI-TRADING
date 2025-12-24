import { useEffect, useState } from "react";
import { TrendingUp, ArrowUpRight, DollarSign, CheckCircle2, Sparkles } from "lucide-react";

interface TradeNotification {
  id: number;
  type: 'profit' | 'withdrawal' | 'trade';
  amount: number;
  user: string;
  timestamp: Date;
}

// Generate random trade notifications
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
    timestamp: new Date(),
  };
};

const TradeCard = ({ trade, index }: { trade: TradeNotification; index: number }) => {
  const icons = {
    profit: <TrendingUp className="w-4 h-4" />,
    withdrawal: <ArrowUpRight className="w-4 h-4" />,
    trade: <DollarSign className="w-4 h-4" />,
  };

  const colors = {
    profit: 'from-success/20 to-success/5 border-success/30 text-success',
    withdrawal: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    trade: 'from-accent/20 to-accent/5 border-accent/30 text-accent',
  };

  const messages = {
    profit: `earned +$${trade.amount.toLocaleString()}`,
    withdrawal: `withdrew $${trade.amount.toLocaleString()}`,
    trade: `placed $${trade.amount.toLocaleString()} trade`,
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${colors[trade.type]} border backdrop-blur-sm animate-slide-notification`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`p-2 rounded-full bg-gradient-to-br ${colors[trade.type]}`}>
        {icons[trade.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          <span className="text-muted-foreground">{trade.user}</span> {messages[trade.type]}
        </p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
    </div>
  );
};

export const LiveTradingFeed = () => {
  const [trades, setTrades] = useState<TradeNotification[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Generate initial trades
    const initialTrades = Array.from({ length: 3 }, (_, i) => generateTrade(i));
    setTrades(initialTrades);
    setCounter(3);

    // Add new trade every 4 seconds
    const interval = setInterval(() => {
      setCounter(prev => prev + 1);
      setTrades(prev => {
        const newTrade = generateTrade(prev.length);
        const updated = [newTrade, ...prev.slice(0, 4)];
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success">Live Activity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 text-gradient">
            Real-Time Trading Activity
          </h2>
          <p className="text-muted-foreground font-serif">
            Watch our traders profit in real-time
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-3">
          {trades.slice(0, 5).map((trade, index) => (
            <TradeCard key={trade.id} trade={trade} index={index} />
          ))}
        </div>

        {/* Stats below feed */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-8 pt-8 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-2xl sm:text-3xl font-bold">$12.5M+</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Profits Generated Today</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-2xl sm:text-3xl font-bold">2,847</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Active Trades</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-accent mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-2xl sm:text-3xl font-bold">99.2%</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};
