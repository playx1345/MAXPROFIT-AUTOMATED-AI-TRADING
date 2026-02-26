import { memo, useState, useCallback } from "react";
import { DemoVideoModal } from "./DemoVideoModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, Lock, CheckCircle, TrendingUp, BarChart3, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const TrustItem = memo(({ icon: Icon, text }: { icon: typeof Shield; text: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
    <span>{text}</span>
  </div>
));
TrustItem.displayName = "TrustItem";

const StatCard = memo(({ value, label }: { value: string; label: string }) => (
  <div className="p-4 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm">
    <div className="text-2xl font-heading font-bold text-primary">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
));
StatCard.displayName = "StatCard";

export const AnimatedHero = memo(() => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleWatchDemo = useCallback(() => {
    setIsVideoModalOpen(true);
  }, []);

  useState(() => {
    setIsLoaded(true);
  });

  return (
    <section 
      className="relative min-h-[90dvh] flex items-center overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-20"
      aria-label="Hero section"
    >
      {/* Deep navy-to-black gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[hsl(222,53%,8%)] via-background to-[hsl(0,0%,0%)]"
        aria-hidden="true"
      />
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.06)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_110%)]"
        aria-hidden="true"
      />
      {/* Primary glow */}
      <div 
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]"
        aria-hidden="true"
      />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text */}
          <div className="max-w-xl">
            {/* Live badge */}
            <div 
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8",
                "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              )}
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-sm font-medium text-primary uppercase tracking-widest">
                Live Trading Active
              </span>
            </div>

            {/* Main heading - Poppins ExtraBold */}
            <h1 
              className={cn(
                "font-heading font-extrabold tracking-tight leading-[1.08] mb-6",
                "text-[2rem] sm:text-[2.5rem] lg:text-[3rem]",
                "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              )}
            >
              <span className="text-foreground">AI‑Powered Crypto</span>{" "}
              <span className="text-foreground">Trading </span>
              <span className="text-primary">Made Simple</span>
            </h1>
            
            {/* Subtitle - Inter Medium */}
            <p 
              className={cn(
                "font-body font-medium text-muted-foreground mb-10 max-w-[520px] leading-relaxed",
                "text-base sm:text-lg lg:text-xl",
                "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              Smart automation, transparent tools, and real‑time insights designed for modern traders.
            </p>

            {/* CTA Buttons - Binance style */}
            <div 
              className={cn(
                "flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10",
                "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[450ms]",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className={cn(
                    "group w-full sm:w-auto min-h-[52px] px-8 text-base font-semibold font-body rounded-lg",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
                    "transition-all duration-300 hover:-translate-y-0.5"
                  )}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleWatchDemo}
                className={cn(
                  "w-full sm:w-auto min-h-[52px] px-8 text-base font-medium font-body rounded-lg",
                  "border-primary/50 text-primary hover:bg-primary/10",
                  "transition-all duration-300 group hover:-translate-y-0.5"
                )}
              >
                <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" aria-hidden="true" />
                How It Works
              </Button>
            </div>

            {/* Trust bar */}
            <div 
              className={cn(
                "flex flex-wrap gap-6",
                "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[550ms]",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              )}
            >
              <TrustItem icon={Shield} text="SSL Secured" />
              <TrustItem icon={Lock} text="KYC Compliant" />
              <TrustItem icon={CheckCircle} text="24/7 Support" />
            </div>
          </div>

          {/* Right column - Dashboard mockup */}
          <div 
            className={cn(
              "hidden lg:block",
              "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-500",
              isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" aria-hidden="true" />
              
              {/* Dashboard mockup card */}
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-foreground text-sm">AI Trading Bot</div>
                      <div className="text-xs text-success flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                        Active
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                    <div className="font-heading font-bold text-success text-lg">94.2%</div>
                  </div>
                </div>

                {/* Chart placeholder */}
                <div className="h-32 rounded-xl bg-muted/30 border border-border/30 flex items-end p-3 gap-1">
                  {[40, 55, 35, 65, 50, 70, 45, 80, 60, 75, 85, 70, 90, 65, 95].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 rounded-t-sm bg-primary/60 transition-all duration-300"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard value="$2.4M" label="Trading Volume" />
                  <StatCard value="1,250+" label="Active Traders" />
                  <StatCard value="$100" label="Min Investment" />
                </div>

                {/* Activity row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm text-muted-foreground">Latest Trade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-success">+$342.50</span>
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <DemoVideoModal 
        open={isVideoModalOpen} 
        onOpenChange={setIsVideoModalOpen} 
      />
    </section>
  );
});

AnimatedHero.displayName = "AnimatedHero";
