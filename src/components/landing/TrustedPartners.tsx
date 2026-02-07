import { memo } from "react";
import { Bitcoin, Wallet, Globe, Shield, Cpu, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const partners = [
  { name: "Bitcoin", icon: Bitcoin },
  { name: "Ethereum", icon: Wallet },
  { name: "Binance", icon: Layers },
  { name: "Solana", icon: Cpu },
  { name: "Polygon", icon: Globe },
  { name: "Secure", icon: Shield },
];

export const TrustedPartners = memo(() => {
  return (
    <section className="py-14 sm:py-20 border-y border-border/40 bg-muted/15">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Trusted & Supported Networks
          </h3>
          <p className="text-sm text-muted-foreground/70">
            Trade across multiple blockchain networks
          </p>
        </div>

        {/* Static grid on all screens - clean, no carousel jank */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {partners.map((partner) => {
            const Icon = partner.icon;
            return (
              <div 
                key={partner.name}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 sm:p-5 rounded-xl",
                  "border border-border/40 bg-card/40",
                  "hover:border-primary/30 hover:bg-card/60",
                  "transition-all duration-300"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 hover:bg-primary/15">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">{partner.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

TrustedPartners.displayName = "TrustedPartners";
