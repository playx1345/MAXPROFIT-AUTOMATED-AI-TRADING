import { useEffect, useState } from "react";
import { TrendingUp, ArrowUpRight, DollarSign, CheckCircle2 } from "lucide-react";

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

const TradeCard = ({ trade }: { trade: TradeNotification }) => {
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
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm animate-fade-in ${color}`}>
      <div className="p-2 rounded-full bg-current/10">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          <span className="opacity-70">{trade.user}</span> {message}
        </p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
    </div>
  );
};

export const LiveTradingFeed = () => {
  const [trades, setTrades] = useState<TradeNotification[]>([]);

  useEffect(() => {
    const initialTrades = Array.from({ length: 3 }, (_, i) => generateTrade(i));
    setTrades(initialTrades);

    const interval = setInterval(() => {
      setTrades(prev => {
        const newTrade = generateTrade(Date.now());
        return [newTrade, ...prev.slice(0, 4)];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success">Live Activity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Real-Time Trading</h2>
          <p className="text-muted-foreground text-lg">Watch our traders profit in real-time</p>
        </div>

        <div className="max-w-xl mx-auto space-y-3">
          {trades.slice(0, 5).map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-success mb-1">$12.5M+</div>
            <p className="text-sm text-muted-foreground">Profits Today</p>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">2,847</div>
            <p className="text-sm text-muted-foreground">Active Trades</p>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">99.2%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};
