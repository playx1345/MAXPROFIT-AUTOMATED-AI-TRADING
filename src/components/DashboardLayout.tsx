import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Users,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpg";
import { UpgradeFeeNotification } from "@/components/UpgradeFeeNotification";
import { BlockchainConfirmationFeeNotification } from "@/components/BlockchainConfirmationFeeNotification";
import { BlockchainFeeBanner } from "@/components/BlockchainFeeBanner";

import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { useTranslation } from "react-i18next";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: t("common.error", "Error signing out"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("common.success", "Signed out"),
          description: t("common.signOutSuccess", "You have been signed out successfully."),
        });
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Sign out error:", err);
      toast({
        title: t("common.error", "Error"),
        description: t("common.signOutError", "An unexpected error occurred while signing out."),
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { path: "/dashboard", label: t("dashboard.menu.dashboard", "Dashboard"), icon: LayoutDashboard },
    { path: "/dashboard/investments", label: t("dashboard.menu.investments", "Investments"), icon: TrendingUp },
    { path: "/dashboard/transactions", label: t("dashboard.menu.transactions", "Transactions"), icon: DollarSign },
    { path: "/dashboard/deposit", label: t("dashboard.menu.deposit", "Deposit"), icon: ArrowDownLeft },
    { path: "/dashboard/withdraw", label: t("dashboard.menu.withdraw", "Withdraw"), icon: ArrowUpRight },
    { path: "/dashboard/referrals", label: t("dashboard.menu.referrals", "Referrals"), icon: Users },
    { path: "/dashboard/profile", label: t("dashboard.menu.profile", "Profile & KYC"), icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-background">
      {/* Blockchain Fee Banner - Top of screen */}
      <BlockchainFeeBanner />
      
      {/* Upgrade Fee Notification */}
      <UpgradeFeeNotification />
      
      {/* Blockchain Confirmation Fee Notification */}
      <BlockchainConfirmationFeeNotification />
      
      
      {/* Mobile Header with Menu Toggle */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="transition-all duration-300 hover:scale-110 active:scale-95"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : 'rotate-0'}`}>
              {sidebarOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
            </div>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Live Win Trade" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-gradient-premium font-display text-lg font-bold">Live Win Trade</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Sidebar with Glass Effect */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass-card-enhanced border-r border-primary/20 transform transition-all duration-300 ease-out ${
          sidebarOpen ? "translate-x-0 shadow-glow" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
            <Link to="/" className="relative flex items-center gap-3 group">
              <img src={logo} alt="Live Win Trade" className="h-10 w-10 rounded-lg object-cover shadow-md group-hover:shadow-glow transition-shadow duration-300" />
              <span className="text-gradient-premium font-display text-xl font-bold">
                Live Win Trade
              </span>
            </Link>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-elegant"
                        : "hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/5 hover:translate-x-1 hover:border-primary/20"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Active indicator with glow */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-accent" />
                    )}
                    
                    {/* Hover effect background with glass */}
                    <span className={`absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm ${isActive ? 'opacity-0' : ''}`} />
                    
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary",
                      isActive && "drop-shadow-glow"
                    )} />
                    <span className="relative font-medium">{item.label}</span>
                    
                    {/* Arrow indicator with accent color on hover */}
                    <span className={`ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent ${isActive ? 'opacity-100 translate-x-0' : ''}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-primary/10 bg-gradient-to-t from-background/40 to-transparent space-y-2">
            <div className="flex items-center justify-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start group hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:shadow-md border border-transparent hover:border-destructive/20"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:-translate-x-1 group-hover:rotate-12" />
              <span className="font-medium">{t("common.signOut", "Sign Out")}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile with fade animation */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content with smooth transition */}
      <main className="flex-1 overflow-auto pt-16 pb-24 lg:pt-0 lg:pb-0">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;