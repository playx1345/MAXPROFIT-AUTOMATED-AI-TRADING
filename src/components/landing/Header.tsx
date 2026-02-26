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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/10" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group flex-shrink-0 transition-all duration-300"
          >
            <div className="relative">
              <div 
                className="absolute -inset-1 rounded-xl bg-primary/20 blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-hidden="true"
              />
              <img 
                src={logo} 
                alt="Live Win Trade Investment logo" 
                width={40}
                height={40}
                className="relative w-10 h-10 rounded-xl object-cover border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-heading font-bold text-lg text-foreground leading-tight transition-colors duration-300 group-hover:text-primary">
                Live Win Trade
              </span>
              <span className="text-xs text-muted-foreground font-body">AI Trading Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation - Frosted glass pill */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/30 backdrop-blur-sm rounded-full px-2 py-1 border border-border/30">
            {navLinks.map((link, index) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-muted-foreground rounded-full",
                  "hover:text-foreground hover:bg-background/60",
                  "transition-all duration-300 active:scale-95"
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <LanguageSelector />
            <ThemeToggle />
            <Link to="/auth">
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-medium transition-all duration-300 hover:bg-muted/50"
              >
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                size="sm" 
                className="font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>

          {/* Mobile Controls - 48px touch target */}
          <div className="flex md:hidden items-center gap-1.5">
            <LanguageSelector />
            <ThemeToggle />
            <button 
              className="flex items-center justify-center w-12 h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300 active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
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

        {/* Mobile Navigation - smooth slide down */}
        <div 
          className={cn(
            "md:hidden grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            mobileMenuOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="pb-4 border-t border-border/50 pt-4">
              <div className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 text-base font-medium min-h-[48px]",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl",
                      "transition-all duration-300 active:scale-[0.98]"
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border/50">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full min-h-[48px] text-base">
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full min-h-[48px] text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
