import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ProfitCounter } from "./ProfitCounter";
import { ArrowRight, Play, Shield, Clock, Users } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const AnimatedHero = () => {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-16">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl" />
              <img 
                src={logo} 
                alt="Live Win Trade" 
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl shadow-primary/20 mx-auto object-cover border border-primary/20" 
              />
            </div>
          </div>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success uppercase tracking-widest">Live Trading Active</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1] animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="text-foreground">Trade Crypto with</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">AI-Powered Precision</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Harness advanced algorithms to maximize your returns. Professional trading made accessible for everyone.
          </p>

          {/* Profit Counter */}
          <div className="mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <ProfitCounter />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Link to="/auth">
              <Button size="lg" className="group w-full sm:w-auto px-8 py-6 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-border hover:bg-muted/50 transition-all duration-300 group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">24/7 Trading</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">1,250+ Active Traders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
