import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Shield, Bot, Users } from "lucide-react";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { InvestmentPlanCard } from "@/components/landing/InvestmentPlanCard";
import { CryptoTicker } from "@/components/landing/CryptoTicker";
import { MarketStats } from "@/components/landing/MarketStats";
import { FAQ } from "@/components/landing/FAQ";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Link } from "react-router-dom";

const Landing = () => {
  const featuresRef = useScrollAnimation(0.1);
  const plansRef = useScrollAnimation(0.1);
  const howItWorksRef = useScrollAnimation(0.1);
  const faqRef = useScrollAnimation(0.1);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <AnimatedHero />

      {/* Crypto Ticker */}
      <CryptoTicker />

      {/* Market Stats Section */}
      <MarketStats />

      {/* Stats Counter Section */}
      <StatsCounter />

      {/* Features Section */}
      <section ref={featuresRef.ref} className="relative py-20 bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className={`text-center mb-16 transition-all duration-400 ${
              featuresRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Why Choose Win Trade Invest?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets professional trading expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Bot}
              title="AI Trading Bot"
              description="Advanced algorithms analyze market trends and execute trades automatically with precision and speed"
            />
            <FeatureCard
              icon={Shield}
              title="Secure Platform"
              description="Bank-level security with KYC verification, encrypted transactions, and cold storage protection"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Performance Tracking"
              description="Real-time portfolio monitoring with detailed profit/loss analytics and comprehensive reports"
            />
            <FeatureCard
              icon={Users}
              title="Referral Program"
              description="Earn generous bonuses when your referrals make their first deposit and start trading"
            />
          </div>
        </div>
      </section>

      {/* Investment Plans Section */}
      <section ref={plansRef.ref} className="relative py-20">
        <div className="container mx-auto px-4">
          <div 
            className={`text-center mb-16 transition-all duration-400 ${
              plansRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Investment Plans
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a plan that matches your investment goals and risk tolerance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <InvestmentPlanCard
              title="Starter Plan"
              risk="Low Risk"
              minInvestment="$100"
              maxInvestment="$999"
              expectedROI="5% - 15%"
              features={[
                "Conservative trading strategies",
                "Lower volatility exposure",
                "Ideal for beginners",
                "24/7 customer support",
                "Monthly performance reports"
              ]}
              glowColor="from-blue-400 to-cyan-600"
            />
            <InvestmentPlanCard
              title="Growth Plan"
              risk="Medium Risk"
              minInvestment="$1,000"
              maxInvestment="$4,999"
              expectedROI="10% - 25%"
              features={[
                "Balanced risk/reward ratio",
                "Multiple trading strategies",
                "Advanced market analysis",
                "Priority customer support",
                "Weekly performance reports"
              ]}
              popular={true}
              glowColor="from-yellow-400 to-orange-600"
            />
            <InvestmentPlanCard
              title="Professional"
              risk="High Risk"
              minInvestment="$5,000"
              maxInvestment="$50,000"
              expectedROI="15% - 40%"
              features={[
                "Aggressive trading strategies",
                "Maximum potential returns",
                "Dedicated account manager",
                "VIP support 24/7",
                "Daily performance reports"
              ]}
              glowColor="from-purple-400 to-pink-600"
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              * Expected ROI ranges are estimates based on historical market conditions and are not guaranteed. 
              Actual returns may vary significantly and can be negative. All investments carry risk.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef.ref} className="relative py-20 bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className={`text-center mb-16 transition-all duration-400 ${
              howItWorksRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">Get started in four simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { num: "1", title: "Sign Up", desc: "Create your account and complete KYC verification for security" },
              { num: "2", title: "Deposit Funds", desc: "Add USDT to your account securely via multiple payment methods" },
              { num: "3", title: "Choose Plan", desc: "Select an investment strategy that fits your goals and risk profile" },
              { num: "4", title: "Track & Earn", desc: "Monitor your portfolio performance and withdraw profits anytime" }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground mx-auto shadow-elegant hover-lift animate-optimized">
                    {step.num}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef.ref} className="relative py-20">
        <div className="container mx-auto px-4">
          <div 
            className={`text-center mb-16 transition-all duration-400 ${
              faqRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our platform
            </p>
          </div>
          
          <div 
            className={`transition-all duration-400 delay-200 ${
              faqRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <FAQ />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t py-16 bg-gradient-to-b from-background to-muted/30">
        {/* Wave divider */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden h-12 -mt-12">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
              className="fill-muted/30"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-2xl mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Win Trade Invest
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional cryptocurrency investment platform with AI-powered automated trading strategies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors">Sign Up</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#risk" className="hover:text-primary transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#help" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><Link to="/admin/login" className="hover:text-primary transition-colors text-xs opacity-50 hover:opacity-100">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              © 2025 Win Trade Invest Platform. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
              Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. 
              Users must be 18+ and comply with local regulations.
            </p>
          </div>

          {/* Risk Warning Banner - Footer */}
          <Alert className="mt-8 bg-destructive/10 border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              <strong>Risk Warning:</strong> Cryptocurrency investments carry significant risk. Past performance does not guarantee future results. You may lose some or all of your investment. Only invest what you can afford to lose.
            </AlertDescription>
          </Alert>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
