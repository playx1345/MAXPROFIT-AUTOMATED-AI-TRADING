import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FloatingElements } from "./FloatingElements";
import { ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo.jpg";
export const AnimatedHero = () => {
  return <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-gradient-hero pt-20 sm:pt-24 pb-8">
      <FloatingElements />
      
      {/* Animated background gradient orbs - smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-12 sm:-left-32 w-32 sm:w-64 lg:w-96 h-32 sm:h-64 lg:h-96 bg-primary/20 rounded-full blur-2xl sm:blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-12 sm:-right-32 w-32 sm:w-64 lg:w-96 h-32 sm:h-64 lg:h-96 bg-accent/15 rounded-full blur-2xl sm:blur-3xl animate-pulse-soft" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[500px] lg:w-[700px] h-[280px] sm:h-[500px] lg:h-[700px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-12 lg:py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-card-enhanced rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 animate-scale-in">
            {/* Logo */}
            <div className="mb-3 sm:mb-5 animate-fade-in">
              <img src={logo} alt="Live Win Trade" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 mx-auto object-cover border-2 border-primary/20" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/30 mb-4 sm:mb-6 animate-fade-in shadow-lg shadow-primary/10 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-serif font-bold tracking-wider sm:tracking-widest text-gradient uppercase">Live Trading</span>
            </div>

            {/* Main heading */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 sm:mb-4 tracking-tight leading-[1.1]">
              <span className="opacity-0 animate-text-reveal text-gradient-premium drop-shadow-[0_0_25px_hsl(var(--primary)/0.4)] sm:drop-shadow-[0_0_35px_hsl(var(--primary)/0.4)] inline-block">
                Live Win Trade
              </span>
              <br />
              
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl font-display font-semibold mb-3 sm:mb-4 opacity-0 animate-text-reveal" style={{
            animationDelay: '0.4s'
          }}>
              <span className="text-gradient-accent">AI Trading Platform</span>
            </p>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/70 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-1 font-sans font-light opacity-0 animate-text-reveal" style={{
            animationDelay: '0.6s'
          }}>
              Harness the power of <span className="text-primary font-medium">AI-driven algorithms</span> to maximize your returns. 
              <span className="block mt-1.5 sm:mt-2 text-muted-foreground text-xs sm:text-sm md:text-base">Professional trading made accessible.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center px-2 sm:px-0">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="group relative overflow-hidden w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 lg:py-6 text-sm sm:text-base font-serif font-semibold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 bg-gradient-primary">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 lg:py-6 text-sm sm:text-base font-serif font-semibold border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 hover:scale-105">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-5 lg:gap-8 text-[10px] sm:text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal animate-pulse shadow-[0_0_6px_hsl(var(--logo-teal)/0.6)]" />
                <span className="text-muted-foreground font-serif font-medium">KYC Verified</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                <span className="text-muted-foreground font-serif font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal animate-pulse shadow-[0_0_6px_hsl(var(--logo-teal)/0.6)]" />
                <span className="text-muted-foreground font-serif font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-40 bg-gradient-to-t from-background to-transparent" />
    </section>;
};