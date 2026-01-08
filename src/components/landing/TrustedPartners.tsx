import { Bitcoin, Wallet, Globe, Shield, Cpu, Layers } from "lucide-react";

const partners = [
  { name: "Bitcoin", icon: Bitcoin },
  { name: "Ethereum", icon: Wallet },
  { name: "Binance", icon: Layers },
  { name: "Solana", icon: Cpu },
  { name: "Polygon", icon: Globe },
  { name: "Secure", icon: Shield },
];

export const TrustedPartners = () => {
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-12 sm:py-16 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Trusted & Supported Networks
          </h3>
          <p className="text-sm text-muted-foreground/70">
            Trade across multiple blockchain networks
          </p>
        </div>

        {/* Logo carousel */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex animate-logo-carousel">
            {duplicatedPartners.map((partner, index) => {
              const Icon = partner.icon;
              return (
                <div key={index} className="flex-shrink-0 mx-8 sm:mx-12">
                  <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{partner.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-10 pt-8 border-t border-border/50">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">SSL Secured</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI Powered</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Globe className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Global Access</span>
          </div>
        </div>
      </div>
    </section>
  );
};
