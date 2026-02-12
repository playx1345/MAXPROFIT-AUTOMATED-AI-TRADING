import { memo, useState, useCallback } from "react";
import { DemoVideoModal } from "./DemoVideoModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TrustIndicator = memo(({ icon: Icon, text }: { icon: typeof Shield; text: string }) => (
  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm">
    <div className="p-1.5 rounded-lg bg-primary/10">
      <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
    </div>
    <span className="text-sm font-medium text-muted-foreground">{text}</span>
  </div>
));

TrustIndicator.displayName = "TrustIndicator";

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
      className="relative min-h-[85dvh] flex items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-20"
      aria-label="Hero section"
    >
      {/* CSS-only gradient mesh background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/8 rounded-full blur-[120px] opacity-60"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-accent/6 rounded-full blur-[100px] opacity-50"
        aria-hidden="true"
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_110%)]"
        aria-hidden="true"
      />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Live badge */}
          <div 
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-8 sm:mb-10",
              "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success uppercase tracking-widest">
              Live Trading Active
            </span>
          </div>

          {/* Main heading */}
          <h1 
            className={cn(
              "text-[clamp(2.25rem,7vw,4.5rem)] font-bold mb-5 sm:mb-6 tracking-tight leading-[1.08]",
              "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
          >
            <span className="text-foreground block">Invest Smarter with</span>
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              AI-Powered Trading
            </span>
          </h1>
          
          {/* Subtitle */}
          <p 
            className={cn(
              "text-base sm:text-lg lg:text-xl text-muted-foreground mb-10 sm:mb-12 max-w-xl mx-auto leading-relaxed",
              "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Professional cryptocurrency investment platform with automated trading strategies. Start with as little as $100.
          </p>

          {/* CTA Buttons */}
          <div 
            className={cn(
              "flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-14",
              "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[450ms]",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className={cn(
                  "group w-full sm:w-auto min-h-[56px] px-10 text-base font-semibold",
                  "bg-primary hover:bg-primary/90",
                  "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
                  "transition-all duration-300 hover:-translate-y-0.5"
                )}
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleWatchDemo}
              className={cn(
                "w-full sm:w-auto min-h-[56px] px-10 text-base font-semibold",
                "border-border/80 hover:bg-muted/50",
                "transition-all duration-300 group hover:-translate-y-0.5"
              )}
            >
              <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" aria-hidden="true" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div 
            className={cn(
              "flex flex-wrap justify-center gap-3 sm:gap-4",
              "transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[550ms]",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            <TrustIndicator icon={Shield} text="Bank-Level Security" />
            <TrustIndicator icon={Zap} text="24/7 Automated Trading" />
            <TrustIndicator icon={Users} text="Verified Platform" />
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
