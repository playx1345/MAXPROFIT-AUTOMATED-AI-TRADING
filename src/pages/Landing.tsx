import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Shield, Bot, Users } from "lucide-react";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { InvestmentPlanCard } from "@/components/landing/InvestmentPlanCard";
import { CryptoTicker } from "@/components/landing/CryptoTicker";
import { MarketStats } from "@/components/landing/MarketStats";
import { LiveTradingFeed } from "@/components/landing/LiveTradingFeed";
import { TrustedPartners } from "@/components/landing/TrustedPartners";
import { FAQ } from "@/components/landing/FAQ";
import { Header } from "@/components/landing/Header";
import { TypingEffect } from "@/components/landing/TypingEffect";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const Landing = () => {
  const featuresRef = useScrollAnimation(0.1);
  const plansRef = useScrollAnimation(0.1);
  const howItWorksRef = useScrollAnimation(0.1);
  const faqRef = useScrollAnimation(0.1);
  
  // Parallax effects for background elements
  const parallaxBg1 = useParallax(0.3);
  const parallaxBg2 = useParallax(-0.2);
  const parallaxBg3 = useParallax(0.15);

  // Intersection observer for scroll animations
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, .scroll-scale, .scroll-rotate');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden scroll-smooth">
      <Header />
      <AnimatedHero />
      <CryptoTicker />
      
      {/* Parallax background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          ref={parallaxBg1.ref}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          style={{ transform: `translateY(${parallaxBg1.offset}px)` }}
        />
        <div 
          ref={parallaxBg2.ref}
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          style={{ transform: `translateY(${parallaxBg2.offset}px)` }}
        />
        <div 
          ref={parallaxBg3.ref}
          className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/3 rounded-full blur-3xl"
          style={{ transform: `translateY(${parallaxBg3.offset}px)` }}
        />
      </div>

      <MarketStats />
      <LiveTradingFeed />
      <StatsCounter />

      {/* Features Section */}
      <section id="features" ref={featuresRef.ref} className="relative py-12 sm:py-16 lg:py-20 bg-muted/30 section-divider z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-10 sm:mb-12 lg:mb-16 scroll-fade-up ${featuresRef.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 sm:mb-4 shimmer-text">
              <TypingEffect 
                texts={[
                  "Why Choose Live Win Trade?",
                  "Cutting-Edge Technology",
                  "Trusted by Thousands",
                  "Industry-Leading Security"
                ]} 
              />
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-serif px-4">
              Advanced technology meets professional trading expertise
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="scroll-fade-up stagger-1"><FeatureCard icon={Bot} title="AI Trading Bot" description="Advanced algorithms analyze market trends and execute trades automatically with precision and speed" /></div>
            <div className="scroll-fade-up stagger-2"><FeatureCard icon={Shield} title="Secure Platform" description="Bank-level security with KYC verification, encrypted transactions, and cold storage protection" /></div>
            <div className="scroll-fade-up stagger-3"><FeatureCard icon={TrendingUp} title="Performance Tracking" description="Real-time portfolio monitoring with detailed profit/loss analytics and comprehensive reports" /></div>
            <div className="scroll-fade-up stagger-4"><FeatureCard icon={Users} title="Referral Program" description="Earn generous bonuses when your referrals make their first deposit and start trading" /></div>
          </div>
        </div>
      </section>

      <TrustedPartners />

      {/* Investment Plans Section */}
      <section id="plans" ref={plansRef.ref} className="relative py-12 sm:py-16 lg:py-20 z-10">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-10 sm:mb-12 lg:mb-16 scroll-fade-up ${plansRef.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 sm:mb-4 shimmer-text">
              <TypingEffect 
                texts={[
                  "Investment Plans",
                  "Grow Your Wealth",
                  "Smart Strategies",
                  "Maximize Returns"
                ]} 
              />
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-serif px-4">
              Choose a plan that matches your investment goals
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="scroll-scale stagger-1">
              <InvestmentPlanCard title="Starter Plan" risk="Low Risk" minInvestment="$100" maxInvestment="$999" expectedROI="5% - 15%" features={["Conservative trading strategies", "Lower volatility exposure", "Ideal for beginners", "24/7 customer support", "Monthly performance reports"]} glowColor="from-amber-400 to-yellow-600" />
            </div>
            <div className="scroll-scale stagger-2">
              <InvestmentPlanCard title="Growth Plan" risk="Medium Risk" minInvestment="$1,000" maxInvestment="$4,999" expectedROI="10% - 25%" features={["Balanced risk/reward ratio", "Multiple trading strategies", "Advanced market analysis", "Priority customer support", "Weekly performance reports"]} popular={true} glowColor="from-yellow-400 to-amber-500" />
            </div>
            <div className="scroll-scale stagger-3">
              <InvestmentPlanCard title="Professional" risk="High Risk" minInvestment="$5,000" maxInvestment="$50,000" expectedROI="15% - 40%" features={["Aggressive trading strategies", "Maximum potential returns", "Dedicated account manager", "VIP support 24/7", "Daily performance reports"]} glowColor="from-orange-400 to-amber-600" />
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12 scroll-fade-up">
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mx-auto px-4 font-serif">
              * Expected ROI ranges are estimates based on historical market conditions and are not guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef.ref} className="relative py-12 sm:py-16 lg:py-20 bg-muted/30 section-divider z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-10 sm:mb-12 lg:mb-16 scroll-fade-up ${howItWorksRef.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 sm:mb-4 shimmer-text">
              <TypingEffect 
                texts={[
                  "How It Works",
                  "Simple & Easy",
                  "Start in Minutes",
                  "Your Journey Begins"
                ]} 
              />
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-serif">Get started in four simple steps</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { num: "1", title: "Sign Up", desc: "Create account & complete KYC" },
              { num: "2", title: "Deposit", desc: "Add USDT securely" },
              { num: "3", title: "Choose Plan", desc: "Select your strategy" },
              { num: "4", title: "Earn", desc: "Track & withdraw profits" }
            ].map((step, index) => (
              <div key={index} className={`text-center group scroll-fade-up stagger-${index + 1}`}>
                <div className="relative mb-3 sm:mb-4 md:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-primary flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold text-primary-foreground mx-auto shadow-elegant hover-lift animate-optimized group-hover:animate-glow-pulse float-animation" style={{ animationDelay: `${index * 0.5}s` }}>
                    {step.num}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-6 sm:top-7 md:top-8 lg:top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-serif font-bold mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-serif leading-relaxed px-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" ref={faqRef.ref} className="relative py-12 sm:py-16 lg:py-20 z-10">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-10 sm:mb-12 lg:mb-16 scroll-fade-up ${faqRef.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 sm:mb-4 shimmer-text">
              <TypingEffect 
                texts={[
                  "Frequently Asked Questions",
                  "Got Questions?",
                  "We Have Answers",
                  "Learn More"
                ]} 
              />
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-serif px-4">
              Find answers to common questions
            </p>
          </div>
          <div className="scroll-fade-up stagger-2">
            <FAQ />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-background to-muted/30 z-10">
        <div className="absolute top-0 left-0 right-0 overflow-hidden h-8 sm:h-12 -mt-8 sm:-mt-12">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-muted/30" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
            <div className="sm:col-span-2 lg:col-span-1 scroll-fade-up stagger-1">
              <h3 className="font-serif font-bold text-xl sm:text-2xl mb-3 sm:mb-4 shimmer-text">Live Win Trade</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-serif">Professional cryptocurrency investment platform with AI-powered automated trading.</p>
            </div>
            <div className="scroll-fade-up stagger-2">
              <h4 className="font-serif font-semibold text-base sm:text-lg mb-3 sm:mb-4">Platform</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground font-serif">
                <li><Link to="/auth" className="hover:text-primary transition-colors">Sign Up</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              </ul>
            </div>
            <div className="scroll-fade-up stagger-3">
              <h4 className="font-serif font-semibold text-base sm:text-lg mb-3 sm:mb-4">Legal</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground font-serif">
                <li><a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#risk" className="hover:text-primary transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
            <div className="scroll-fade-up stagger-4">
              <h4 className="font-serif font-semibold text-base sm:text-lg mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground font-serif">
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><Link to="/admin/login" className="hover:text-primary transition-colors text-xs opacity-50 hover:opacity-100">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 sm:pt-8 text-center space-y-2 sm:space-y-3 scroll-fade-up">
            <p className="text-xs sm:text-sm text-muted-foreground font-serif">© 2025 Live Win Trade Investment. All rights reserved.</p>
          </div>

          <Alert className="mt-6 sm:mt-8 bg-destructive/10 border-destructive/50 scroll-fade-up stagger-2">
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <AlertDescription className="text-xs sm:text-sm font-serif font-medium">
              <strong>Risk Warning:</strong> Cryptocurrency investments carry significant risk. Past performance does not guarantee future results.
            </AlertDescription>
          </Alert>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
