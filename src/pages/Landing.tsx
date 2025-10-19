import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Shield, Bot, Users, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Risk Warning Banner */}
      <Alert className="rounded-none border-x-0 border-t-0 bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm font-medium">
          <strong>Risk Warning:</strong> Cryptocurrency investments carry significant risk. Past performance does not guarantee future results. You may lose some or all of your investment. Only invest what you can afford to lose.
        </AlertDescription>
      </Alert>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Smart Crypto Investment Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automated trading strategies powered by AI. Professional portfolio management with transparent performance tracking.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Bot className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>AI Trading Bot</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced algorithms analyze market trends and execute trades automatically
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Bank-level security with KYC verification and encrypted transactions
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time portfolio monitoring with detailed profit/loss analytics
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn bonuses when your referrals make their first deposit
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Investment Plans</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a plan that matches your investment goals and risk tolerance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="relative">
            <CardHeader>
              <div className="text-sm font-semibold text-green-600 mb-2">LOW RISK</div>
              <CardTitle className="text-2xl">Starter Plan</CardTitle>
              <CardDescription className="text-base">Perfect for beginners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold">$100 - $999</div>
                <div className="text-sm text-muted-foreground">Investment Range</div>
              </div>
              <div>
                <div className="text-lg font-semibold">5% - 15% Expected ROI</div>
                <div className="text-sm text-muted-foreground">Per 30 days</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                  Conservative strategies
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                  Lower volatility exposure
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              POPULAR
            </div>
            <CardHeader>
              <div className="text-sm font-semibold text-yellow-600 mb-2">MEDIUM RISK</div>
              <CardTitle className="text-2xl">Growth Plan</CardTitle>
              <CardDescription className="text-base">Balanced approach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold">$1K - $5K</div>
                <div className="text-sm text-muted-foreground">Investment Range</div>
              </div>
              <div>
                <div className="text-lg font-semibold">10% - 25% Expected ROI</div>
                <div className="text-sm text-muted-foreground">Per 30 days</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                  Balanced risk/reward
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                  Multiple strategies
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader>
              <div className="text-sm font-semibold text-red-600 mb-2">HIGH RISK</div>
              <CardTitle className="text-2xl">Professional</CardTitle>
              <CardDescription className="text-base">For experienced investors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold">$5K - $50K</div>
                <div className="text-sm text-muted-foreground">Investment Range</div>
              </div>
              <div>
                <div className="text-lg font-semibold">15% - 40% Expected ROI</div>
                <div className="text-sm text-muted-foreground">Per 30 days</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                  Aggressive strategies
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                  Maximum potential returns
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            * Expected ROI ranges are estimates based on market conditions and are not guaranteed. Actual returns may vary and can be negative.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-sm text-muted-foreground">Create your account and complete KYC verification</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Deposit Funds</h3>
              <p className="text-sm text-muted-foreground">Add USDT to your account securely</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Choose Plan</h3>
              <p className="text-sm text-muted-foreground">Select an investment strategy that fits your goals</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Track & Earn</h3>
              <p className="text-sm text-muted-foreground">Monitor performance and withdraw anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CryptoInvest</h3>
              <p className="text-sm text-muted-foreground">
                Professional cryptocurrency investment platform with automated trading strategies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth">Sign Up</Link></li>
                <li><Link to="/auth">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#risk">Risk Disclosure</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 CryptoInvest Platform. All rights reserved.</p>
            <p className="mt-2">Trading cryptocurrencies involves substantial risk of loss. Users must be 18+.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;