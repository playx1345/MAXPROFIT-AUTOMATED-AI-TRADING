import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FloatingElements } from "./FloatingElements";
import { ArrowRight, Sparkles } from "lucide-react";

export const AnimatedHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      <FloatingElements />
      
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-card-enhanced rounded-3xl p-8 md:p-14 animate-scale-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/25 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold tracking-wide text-primary">AI-Powered Trading Platform</span>
            </div>

            {/* Main heading */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
              <span className="text-gradient-premium">
                Live Win Trade Investment
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-display font-medium text-foreground/90 mb-4">
              AI Trading Platform
            </p>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Harness the power of AI-driven algorithms to maximize your returns in the crypto and forex markets. Professional trading made accessible.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="group relative overflow-hidden px-10 py-7 text-lg font-semibold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 bg-gradient-primary">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="px-10 py-7 text-lg font-semibold border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 hover:scale-105">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex flex-wrap justify-center gap-10 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span className="text-muted-foreground font-medium">KYC Verified</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <span className="text-muted-foreground font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
