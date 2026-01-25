import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  // Track scroll position for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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

  const navLinks = [
    { label: t('nav.features'), id: 'features' },
    { label: t('nav.plans'), id: 'plans' },
    { label: t('nav.howItWorks'), id: 'how-it-works' },
    { label: t('nav.faq'), id: 'faq' },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/10" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Positioned at left */}
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-3 group flex-shrink-0",
              "transition-all duration-300"
            )}
          >
            <div className="relative">
              {/* Glow effect */}
              <div 
                className={cn(
                  "absolute -inset-1 rounded-xl bg-primary/20 blur-md transition-all duration-300",
                  "opacity-0 group-hover:opacity-100"
                )}
                aria-hidden="true"
              />
              <img 
                src={logo} 
                alt="Live Win Trade" 
                className={cn(
                  "relative w-10 h-10 rounded-xl object-cover border border-border/50",
                  "transition-all duration-300",
                  "group-hover:border-primary/50 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20"
                )}
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className={cn(
                "font-bold text-lg text-foreground leading-tight transition-colors duration-300",
                "group-hover:text-primary"
              )}>
                Live Win Trade
              </span>
              <span className="text-xs text-muted-foreground">AI Trading Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/30 backdrop-blur-sm rounded-full px-2 py-1 border border-border/30">
            {navLinks.map((link, index) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-muted-foreground rounded-full",
                  "hover:text-foreground hover:bg-background/50",
                  "transition-all duration-300",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA - Right */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <LanguageSelector />
            <ThemeToggle />
            <Link to="/auth">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "font-medium transition-all duration-300",
                  "hover:bg-muted/50"
                )}
              >
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                size="sm" 
                className={cn(
                  "font-medium bg-primary hover:bg-primary/90",
                  "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                  "transition-all duration-300 hover:-translate-y-0.5"
                )}
              >
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button 
              className={cn(
                "p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg",
                "transition-all duration-300"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <Menu 
                  className={cn(
                    "absolute inset-0 w-5 h-5 transition-all duration-300",
                    mobileMenuOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                  )} 
                />
                <X 
                  className={cn(
                    "absolute inset-0 w-5 h-5 transition-all duration-300",
                    mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                  )} 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500 ease-out",
            mobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          )}
        >
          <div className="pb-4 border-t border-border/50 pt-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-base font-medium",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg",
                    "transition-all duration-300",
                    mobileMenuOpen && "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    {t('nav.getStarted')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
