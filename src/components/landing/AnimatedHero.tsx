import { memo, useEffect, useState, useCallback } from "react";
import { DemoVideoModal } from "./DemoVideoModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ProfitCounter } from "./ProfitCounter";
import { ParticleNetwork } from "./ParticleNetwork";
import { TradingChart } from "./TradingChart";
import { ArrowRight, Play, Shield, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TrustIndicator = memo(({ icon: Icon, text }: { icon: typeof Shield; text: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
));

TrustIndicator.displayName = "TrustIndicator";

export const AnimatedHero = memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleWatchDemo = useCallback(() => {
    setIsVideoModalOpen(true);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    
    // Check if mobile or reduced motion - skip effects
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || prefersReducedMotion) return;
    
    // Throttle helper for 60fps max
    let lastMouseMove = 0;
    let lastScroll = 0;
    let rafId: number | null = null;
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove < 16) return; // ~60fps throttle
      lastMouseMove = now;
      
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScroll < 16) return; // ~60fps throttle
      lastScroll = now;
      
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section 
      className="relative min-h-[85dvh] sm:min-h-[90dvh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16"
      aria-label="Hero section"
    >
      {/* Particle Network Background */}
      <ParticleNetwork className="opacity-30" />
      
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        aria-hidden="true"
      />
      
      {/* Single gradient orb */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px] motion-reduce:hidden"
        style={{
          transform: `translate(-50%, 0) translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`,
          transition: 'transform 0.4s ease-out',
        }}
        aria-hidden="true"
      />
      
      {/* Trading Chart Preview - Hidden on smaller screens */}
      <div 
        className={cn(
          "absolute right-8 top-1/2 -translate-y-1/2 w-72 h-44 hidden 2xl:block",
          "transition-all duration-700 delay-500",
          isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        )}
        aria-hidden="true"
      >
        <TradingChart />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Live badge */}
          <div 
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6 sm:mb-8",
              "transition-all duration-500",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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

          {/* Main heading - fluid typography */}
          <h1 
            className={cn(
              "text-[clamp(2rem,6vw,4rem)] font-bold mb-4 sm:mb-6 tracking-tight leading-[1.1]",
              "transition-all duration-500 delay-100",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-foreground block">Trade Crypto with</span>
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              AI-Powered Precision
            </span>
          </h1>
          
          {/* Subtitle */}
          <p 
            className={cn(
              "text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed",
              "transition-all duration-500 delay-200",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Harness advanced algorithms to maximize your returns. Professional trading made accessible for everyone.
          </p>

          {/* Profit Counter */}
          <div 
            className={cn(
              "mb-8 sm:mb-10 transition-all duration-500 delay-300",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <ProfitCounter />
          </div>

          {/* CTA Buttons - larger touch targets */}
          <div 
            className={cn(
              "flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10 sm:mb-12",
              "transition-all duration-500 delay-400",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className={cn(
                  "group w-full sm:w-auto min-h-[56px] px-8 text-base font-semibold",
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
                "w-full sm:w-auto min-h-[56px] px-8 text-base font-semibold",
                "border-border hover:bg-muted/50",
                "transition-all duration-300 group hover:-translate-y-0.5"
              )}
            >
              <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" aria-hidden="true" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators - 3 key badges only */}
          <div 
            className={cn(
              "flex flex-wrap justify-center gap-4 sm:gap-6",
              "transition-all duration-500 delay-500",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <TrustIndicator icon={Shield} text="Bank-Level Security" />
            <TrustIndicator icon={Zap} text="24/7 Trading" />
            <TrustIndicator icon={Users} text="1,250+ Traders" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      {/* Demo Video Modal */}
      <DemoVideoModal 
        open={isVideoModalOpen} 
        onOpenChange={setIsVideoModalOpen} 
      />
    </section>
  );
});

AnimatedHero.displayName = "AnimatedHero";
