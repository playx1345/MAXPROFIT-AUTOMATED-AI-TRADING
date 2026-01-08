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
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      <Header />
      <AnimatedHero />
      <CryptoTicker />
      <MarketStats />
      <LiveTradingFeed />
      <StatsCounter />

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why Choose Live Win Trade?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets professional trading expertise
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard 
              icon={Bot} 
              title="AI Trading Bot" 
              description="Advanced algorithms analyze market trends and execute trades automatically with precision" 
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure Platform" 
              description="Bank-level security with KYC verification and encrypted transactions" 
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Performance Tracking" 
              description="Real-time portfolio monitoring with detailed profit/loss analytics" 
            />
            <FeatureCard 
              icon={Users} 
              title="Referral Program" 
              description="Earn generous bonuses when your referrals make their first deposit" 
            />
          </div>
        </div>
      </section>

      <TrustedPartners />

      {/* Investment Plans Section */}
      <section id="plans" className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Investment Plans
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a plan that matches your investment goals
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
            />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10 max-w-3xl mx-auto">
            * Expected ROI ranges are estimates based on historical market conditions and are not guaranteed.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              { num: "1", title: "Sign Up", desc: "Create account & complete KYC" },
              { num: "2", title: "Deposit", desc: "Add USDT securely" },
              { num: "3", title: "Choose Plan", desc: "Select your strategy" },
              { num: "4", title: "Earn", desc: "Track & withdraw profits" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions
            </p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold text-xl mb-4">Live Win Trade</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional cryptocurrency investment platform with AI-powered automated trading.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#risk" className="hover:text-foreground transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><Link to="/admin/login" className="hover:text-foreground transition-colors text-xs opacity-50 hover:opacity-100">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2025 Live Win Trade Investment. All rights reserved.</p>
          </div>

          <Alert className="mt-8 bg-destructive/10 border-destructive/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Risk Warning:</strong> Cryptocurrency investments carry significant risk. Past performance does not guarantee future results.
            </AlertDescription>
          </Alert>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
