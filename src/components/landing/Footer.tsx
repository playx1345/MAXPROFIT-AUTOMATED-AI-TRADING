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
import logo from "@/assets/logo.jpg";
import { toast } from "sonner";

const footerLinks = {
  platform: [
    { label: "Features", href: "#features" },
    { label: "Investment Plans", href: "#plans" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ],
  support: [
    { label: "Help Center", href: "#faq" },
    { label: "Contact Us", href: "#faq" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
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
    <footer className="relative overflow-hidden" role="contentinfo">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden="true" />
      
      <div className="bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Main footer content */}
          <div className="py-14 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
              {/* Brand column */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-5">
                  <img 
                    src={logo} 
                    alt="Live Win Trade" 
                    className="w-10 h-10 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <span className="font-bold text-lg">Live Win Trade</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                  Professional AI-powered cryptocurrency trading platform. 
                  Start investing with confidence.
                </p>
                
                {/* Social links */}
                <div className="flex gap-3">
                  {footerLinks.social.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={cn(
                        "w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                        "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
                      )}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Platform links */}
              <div>
                <h3 className="font-semibold mb-5 text-foreground">Platform</h3>
                <ul className="space-y-3.5">
                  {footerLinks.platform.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support links */}
              <div>
                <h3 className="font-semibold mb-5 text-foreground">Support</h3>
                <ul className="space-y-3.5">
                  {footerLinks.support.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter - improved form */}
              <div>
                <h3 className="font-semibold mb-5 text-foreground">Stay Updated</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest trading insights and updates.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-[48px] text-base"
                    required
                  />
                  <Button type="submit" className="w-full min-h-[48px] text-base font-medium bg-primary hover:bg-primary/90">
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 border-t border-border/40">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                <span>© {new Date().getFullYear()} Live Win Trade.</span>
                <span className="hidden sm:inline">•</span>
                <span>All rights reserved.</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <Link 
                  to="/auth" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
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
            
            {/* Risk warning */}
            <p className="text-xs text-muted-foreground/60 text-center mt-6 max-w-3xl mx-auto leading-relaxed">
              ⚠️ Risk Warning: Cryptocurrency investments carry significant risk. Past performance does not guarantee future results. 
              Only invest what you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
