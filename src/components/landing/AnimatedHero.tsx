import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ProfitCounter } from "./ProfitCounter";
import { ParticleNetwork } from "./ParticleNetwork";
import { TradingChart } from "./TradingChart";
import { ArrowRight, Play, Shield, Clock, Users, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpg";
import { SecurityBadge, SecureConnectionBadge } from "@/components/ui/security-badge";

const TrustIndicator = memo(({ icon: Icon, text }: { icon: typeof Shield; text: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground group cursor-default">
    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
      <Icon className="w-4 h-4 text-primary transition-transform group-hover:scale-110" aria-hidden="true" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
));

TrustIndicator.displayName = "TrustIndicator";

export const AnimatedHero = memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Only update if not reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-16"
      aria-label="Hero section"
    >
      {/* Particle Network Background */}
      <ParticleNetwork className="opacity-40" />
      
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        aria-hidden="true"
      />
      
      {/* Parallax gradient orbs */}
      <div 
        className={cn(
          "absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]",
          "animate-pulse-soft will-change-transform motion-reduce:animate-none"
        )}
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: 'transform 0.3s ease-out',
        }}
        aria-hidden="true"
      />
      <div 
        className={cn(
          "absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/6 rounded-full blur-[120px]",
          "animate-pulse-soft will-change-transform motion-reduce:animate-none"
        )}
        style={{ 
          animationDelay: '2s',
          transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
          transition: 'transform 0.3s ease-out',
        }}
        aria-hidden="true"
      />
      
      {/* Trading Chart Preview - Hidden on mobile */}
      <div 
        className={cn(
          "absolute right-8 top-1/2 -translate-y-1/2 w-80 h-48 hidden xl:block",
          "transition-all duration-700 delay-700",
          isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        )}
        aria-hidden="true"
      >
        <TradingChart />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div 
            className={cn(
              "mb-8 transition-all duration-700",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="relative inline-block group">
              <div 
                className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl transition-all duration-300 group-hover:bg-primary/30 group-hover:blur-2xl"
                aria-hidden="true"
              />
              <img 
                src={logo} 
                alt="Live Win Trade Logo" 
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl shadow-primary/20 mx-auto object-cover border border-primary/20 transition-transform duration-300 group-hover:scale-105" 
                loading="eager"
                width={96}
                height={96}
              />
            </div>
          </div>

          {/* Secure Connection Badge */}
          <div 
            className={cn(
              "mb-4 transition-all duration-700 delay-75",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <SecureConnectionBadge />
          </div>

          {/* Live badge */}
          <div 
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-8",
              "transition-all duration-700 delay-100",
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

          {/* Main heading */}
          <h1 
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]",
              "transition-all duration-700 delay-200",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-foreground block">Trade Crypto with</span>
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent text-balance">
              AI-Powered Precision
            </span>
          </h1>
          
          {/* Subtitle */}
          <p 
            className={cn(
              "text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-balance",
              "transition-all duration-700 delay-300",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Harness advanced algorithms to maximize your returns. Professional trading made accessible for everyone.
          </p>

          {/* Profit Counter */}
          <div 
            className={cn(
              "mb-10 transition-all duration-700 delay-400",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <ProfitCounter />
          </div>

          {/* CTA Buttons */}
          <div 
            className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center items-center mb-12",
              "transition-all duration-700 delay-500",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Link to="/auth">
              <Button 
                size="lg" 
                className={cn(
                  "group w-full sm:w-auto px-8 py-6 text-base font-semibold",
                  "bg-primary hover:bg-primary/90",
                  "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
                  "transition-all duration-300 hover:-translate-y-0.5"
                )}
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="outline" 
                className={cn(
                  "w-full sm:w-auto px-8 py-6 text-base font-semibold",
                  "border-border hover:bg-muted/50",
                  "transition-all duration-300 group hover:-translate-y-0.5"
                )}
              >
                <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" aria-hidden="true" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div 
            className={cn(
              "flex flex-wrap justify-center gap-4 sm:gap-6",
              "transition-all duration-700 delay-600",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <TrustIndicator icon={Shield} text="Bank-Level Security" />
            <TrustIndicator icon={Lock} text="256-bit Encryption" />
            <TrustIndicator icon={Zap} text="24/7 Trading" />
            <TrustIndicator icon={Users} text="1,250+ Active Traders" />
          </div>
          
          {/* Security Badges */}
          <div 
            className={cn(
              "flex flex-wrap justify-center gap-3 mt-8",
              "transition-all duration-700 delay-700",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <SecurityBadge variant="shield" size="sm" />
            <SecurityBadge variant="encrypted" size="sm" />
            <SecurityBadge variant="verified" size="sm" label="KYC Verified" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />
    </section>
  );
});

AnimatedHero.displayName = "AnimatedHero";
