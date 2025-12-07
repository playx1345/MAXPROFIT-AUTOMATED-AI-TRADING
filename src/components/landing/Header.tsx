import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.jpg";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const scrollToSection = (sectionId: string) => {
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-primary rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <img src={logo} alt="Live Win Trade" className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" />
            </div>
            <span className="font-serif font-bold text-sm sm:text-base text-foreground hidden xs:inline">Live Win Trade</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => scrollToSection("features")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection("plans")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              Plans
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </button>
          </div>

          {/* Desktop CTA Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-serif font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-primary font-serif font-medium shadow-elegant hover:shadow-glow transition-all">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile: Theme Toggle & Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button 
              className="p-2 text-muted-foreground hover:text-primary transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 sm:mt-4 pb-4 border-t border-border/40 pt-4 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4">
              <button onClick={() => scrollToSection("features")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                Features
              </button>
              <button onClick={() => scrollToSection("plans")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                Plans
              </button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                How It Works
              </button>
              <button onClick={() => scrollToSection("faq")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                FAQ
              </button>
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/30">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full font-serif font-medium h-10 sm:h-11">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-gradient-primary font-serif font-medium h-10 sm:h-11">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};