import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Twitter, 
  MessageCircle, 
  Send, 
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/lwt-logo.png";
import { toast } from "sonner";

const footerLinks = {
  platform: [
    { label: "Plans", href: "#plans" },
    { label: "Live Market", href: "#market" },
    { label: "AI Trading Modes", href: "#features" },
    { label: "Referral Program", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#faq" },
    { label: "Tutorials", href: "#how-it-works" },
    { label: "Contact Support", href: "#faq" },
    { label: "Security & Safety", href: "#" },
  ],
  legal: [
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Risk Disclosure", href: "/legal/risk" },
    { label: "AML/KYC Policy", href: "/legal/aml-kyc" },
  ],
  social: [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: MessageCircle, label: "Discord", href: "#" },
    { icon: Send, label: "Telegram", href: "#" },
  ],
};

export const Footer = memo(() => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[hsl(220,18%,4%)]" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Main footer content */}
        <div className="py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img 
                  src={logo} 
                  alt="Live Win Trade Investment logo" 
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-cover"
                  loading="lazy"
                />
                <span className="font-heading font-bold text-lg text-foreground">Live Win Trade</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed font-body">
                AI‑driven trading tools for modern investors. Secure, transparent, and always available.
              </p>
              
              {/* Newsletter */}
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-xs">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[44px] text-sm bg-muted/30 border-border/50 font-body"
                  required
                />
                <Button type="submit" size="icon" className="min-h-[44px] min-w-[44px] bg-primary hover:bg-primary/90">
                  <Mail className="w-4 h-4" />
                </Button>
              </form>

              {/* Social links */}
              <div className="flex gap-3 mt-6">
                {footerLinks.social.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={cn(
                      "w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center",
                      "text-muted-foreground hover:text-primary hover:bg-primary/10",
                      "transition-all duration-300"
                    )}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h3 className="font-heading font-semibold text-lg mb-5 text-foreground">Platform</h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h3 className="font-heading font-semibold text-lg mb-5 text-foreground">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="font-heading font-semibold text-lg mb-5 text-foreground">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar - Binance style divider */}
        <div className="py-6 border-t border-[hsl(220,14%,14%)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-body text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Live Win Trade. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4 text-sm font-body">
              <Link 
                to="/auth" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/admin/login" 
                className="text-muted-foreground/50 hover:text-muted-foreground text-xs transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
