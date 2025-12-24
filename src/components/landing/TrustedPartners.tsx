import { Bitcoin, Wallet, Globe, Shield, Cpu, Layers } from "lucide-react";

const partners = [
  { name: "Bitcoin", icon: Bitcoin, color: "text-bitcoin" },
  { name: "Ethereum", icon: Wallet, color: "text-primary" },
  { name: "Binance", icon: Layers, color: "text-primary" },
  { name: "Solana", icon: Cpu, color: "text-accent" },
  { name: "Polygon", icon: Globe, color: "text-teal" },
  { name: "Secure", icon: Shield, color: "text-success" },
];

export const TrustedPartners = () => {
  // Double the partners for infinite scroll effect
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden border-y border-border/30">
      <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-background to-muted/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-muted-foreground mb-2">
            Trusted & Supported Networks
          </h3>
          <p className="text-sm text-muted-foreground/70">
            Trade across multiple blockchain networks with confidence
          </p>
        </div>

        {/* Logo carousel */}
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex animate-logo-carousel">
            {duplicatedPartners.map((partner, index) => {
              const Icon = partner.icon;
              return (
                <div
                  key={index}
                  className="flex-shrink-0 mx-6 sm:mx-10 group"
                >
                  <div className="flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl glass-card hover:border-primary/40 transition-all duration-300 hover:scale-105">
                    <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 group-hover:border-primary/30 transition-colors ${partner.color}`}>
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {partner.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-border/30">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-xs sm:text-sm text-muted-foreground">SSL Secured</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">AI Powered</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
            <Globe className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm text-muted-foreground">Global Access</span>
          </div>
        </div>
      </div>
    </section>
  );
};
