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

  const navLinks = [
    { label: t('nav.features'), id: 'features' },
    { label: t('nav.plans'), id: 'plans' },
    { label: t('nav.howItWorks'), id: 'how-it-works' },
    { label: t('nav.faq'), id: 'faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img src={logo} alt="Live Win Trade" className="w-10 h-10 rounded-xl object-cover border border-border/50 group-hover:border-primary/50 transition-colors" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">Live Win Trade</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-medium">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="font-medium bg-primary hover:bg-primary/90">
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button 
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="w-full text-left px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
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
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90">
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
