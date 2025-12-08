import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FloatingElements } from "./FloatingElements";
import { ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const AnimatedHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-16 sm:pt-20">
      <FloatingElements />
      
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-16 sm:-left-32 w-48 sm:w-96 h-48 sm:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div 
          className="absolute bottom-1/4 -right-16 sm:-right-32 w-48 sm:w-96 h-48 sm:h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-soft" 
          style={{ animationDelay: '1s' }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-card-enhanced rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 lg:p-14 animate-scale-in">
            {/* Logo */}
            <div className="mb-4 sm:mb-6 animate-fade-in">
              <img 
                src={logo} 
                alt="Live Win Trade" 
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl shadow-xl shadow-primary/25 mx-auto object-cover border-2 border-primary/20" 
              />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/30 mb-6 sm:mb-8 animate-fade-in shadow-lg shadow-primary/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
              <span className="text-sm sm:text-base font-serif font-bold tracking-widest text-gradient uppercase">Live Trading</span>
            </div>

            {/* Main heading */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              <span className="text-gradient-premium drop-shadow-[0_0_35px_hsl(var(--primary)/0.4)]">
                Live Win Trade
              </span>
              <br />
              <span className="text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold italic">
                Investment
              </span>
            </h1>
            
            <p className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold mb-4 sm:mb-5">
              <span className="text-gradient-accent">AI Trading Platform</span>
            </p>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/70 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2 font-sans font-light">
              Harness the power of <span className="text-primary font-medium">AI-driven algorithms</span> to maximize your returns in the crypto and forex markets. 
              <span className="block mt-2 text-muted-foreground">Professional trading made accessible.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 lg:py-7 text-base sm:text-lg font-serif font-semibold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 bg-gradient-primary"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 lg:py-7 text-base sm:text-lg font-serif font-semibold border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-10 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-teal animate-pulse shadow-[0_0_8px_hsl(var(--logo-teal)/0.6)]" />
                <span className="text-muted-foreground font-serif font-medium">KYC Verified</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                <span className="text-muted-foreground font-serif font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-teal animate-pulse shadow-[0_0_8px_hsl(var(--logo-teal)/0.6)]" />
                <span className="text-muted-foreground font-serif font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
