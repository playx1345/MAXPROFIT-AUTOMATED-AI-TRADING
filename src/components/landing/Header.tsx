import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import logo from "@/assets/logo.jpg";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/40 safe-area-top">
      <nav className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-primary rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <img src={logo} alt="Live Win Trade" className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg object-cover" />
            </div>
            <span className="font-serif font-bold text-xs sm:text-sm text-foreground truncate max-w-[100px] sm:max-w-none">Live Win Trade</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => scrollToSection("features")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.features')}
            </button>
            <button onClick={() => scrollToSection("plans")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.plans')}
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.howItWorks')}
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.faq')}
            </button>
          </div>

          {/* Desktop CTA Buttons & Theme Toggle & Language */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-serif font-medium">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-primary font-serif font-medium shadow-elegant hover:shadow-glow transition-all">
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>

          {/* Mobile: Language, Theme Toggle & Menu Button */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button 
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 sm:mt-4 pb-4 border-t border-border/40 pt-4 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4">
              <button onClick={() => scrollToSection("features")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                {t('nav.features')}
              </button>
              <button onClick={() => scrollToSection("plans")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                {t('nav.plans')}
              </button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                {t('nav.howItWorks')}
              </button>
              <button onClick={() => scrollToSection("faq")} className="text-sm sm:text-base font-serif font-medium text-muted-foreground hover:text-primary transition-colors text-left py-1">
                {t('nav.faq')}
              </button>
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/30">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full font-serif font-medium h-10 sm:h-11">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-gradient-primary font-serif font-medium h-10 sm:h-11">
                    {t('nav.getStarted')}
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
