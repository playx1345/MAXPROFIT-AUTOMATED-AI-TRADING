import { Bitcoin, TrendingUp, Zap, DollarSign } from "lucide-react";

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
      
      {/* Floating crypto icons */}
      <div className="animate-float animate-optimized">
        <div className="absolute top-24 left-16 p-3 rounded-xl bg-gradient-to-br from-bitcoin/20 to-bitcoin/5 border border-bitcoin/20 backdrop-blur-sm">
          <Bitcoin className="w-8 h-8 text-bitcoin" />
        </div>
      </div>
      
      <div className="animate-float animate-optimized [animation-delay:0.5s]">
        <div className="absolute top-40 right-24 p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-sm">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <div className="animate-float animate-optimized [animation-delay:1s]">
        <div className="absolute bottom-48 left-[15%] p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 backdrop-blur-sm">
          <Zap className="w-7 h-7 text-accent" />
        </div>
      </div>
      
      <div className="animate-float animate-optimized [animation-delay:1.5s]">
        <div className="absolute bottom-32 right-[20%] p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/5 border border-success/20 backdrop-blur-sm">
          <DollarSign className="w-7 h-7 text-success" />
        </div>
      </div>

      {/* Glowing lines */}
      <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      
      {/* Particle shimmer effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent animate-shimmer" />
    </div>
  );
};