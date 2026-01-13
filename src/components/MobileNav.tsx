import { memo, useCallback, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, TrendingUp, ArrowUpRight, User, LogOut, MoreHorizontal, X, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Wallet, label: "Deposit", path: "/dashboard/deposit" },
  { icon: TrendingUp, label: "Invest", path: "/dashboard/investments" },
  { icon: ArrowUpRight, label: "Withdraw", path: "/dashboard/withdraw" },
];

const moreNavItems = [
  { icon: FileText, label: "Transactions", path: "/dashboard/transactions" },
  { icon: Users, label: "Referrals", path: "/dashboard/referrals" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

// Haptic feedback utility
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[style]);
  }
};

export const MobileNav = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  // Swipe gesture state
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [swipeIndicator, setSwipeIndicator] = useState<'left' | 'right' | null>(null);

  const allNavItems = [...mainNavItems, ...moreNavItems];
  const currentIndex = allNavItems.findIndex(item => item.path === location.pathname);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    
    // Only show indicator for horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) > 30 && deltaY < 50) {
      setSwipeIndicator(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeIndicator(null);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    
    setSwipeIndicator(null);
    
    // Minimum swipe distance and ensure horizontal (not vertical scroll)
    if (Math.abs(deltaX) > 80 && deltaY < 50) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous
        triggerHaptic('medium');
        navigate(allNavItems[currentIndex - 1].path);
      } else if (deltaX < 0 && currentIndex < allNavItems.length - 1) {
        // Swipe left - go to next
        triggerHaptic('medium');
        navigate(allNavItems[currentIndex + 1].path);
      }
    }
  }, [currentIndex, navigate, allNavItems]);

  const handleNavClick = useCallback((path: string) => {
    triggerHaptic('light');
    setIsMoreOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    triggerHaptic('medium');
    setIsMoreOpen(false);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: t("common.error", "Error"),
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
        description: t("common.signOutError", "An unexpected error occurred."),
        variant: "destructive",
      });
    }
  }, [navigate, toast, t]);

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicator */}
      {swipeIndicator && (
        <div className={cn(
          "absolute top-0 h-1 bg-primary/50 transition-all duration-150",
          swipeIndicator === 'left' ? "right-0 w-16" : "left-0 w-16"
        )} />
      )}
      
      <div className="bg-card/95 backdrop-blur-xl border-t border-border">
        {/* Progress indicator showing current position */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ 
              width: `${((currentIndex + 1) / allNavItems.length) * 100}%`,
              marginLeft: 0
            }}
          />
        </div>
        
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl",
                  "transition-all duration-300 min-w-[60px]",
                  "active:scale-90",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-xl animate-fade-in" />
                )}
                
                <div className={cn(
                  "relative p-1.5 rounded-lg transition-all duration-300",
                  isActive && "bg-primary/20 scale-110"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive && "text-primary drop-shadow-glow"
                  )} />
                  
                  {/* Ripple effect on active */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg bg-primary/20 animate-ping opacity-75" />
                  )}
                </div>
                
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "text-primary font-semibold" : ""
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
          
          {/* More Menu Drawer */}
          <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DrawerTrigger asChild>
              <button
                onClick={() => triggerHaptic('light')}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl",
                  "transition-all duration-300 min-w-[60px]",
                  "active:scale-90 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative p-1.5 rounded-lg transition-all duration-300">
                  <MoreHorizontal className="w-5 h-5 transition-all duration-200" />
                </div>
                <span className="text-[10px] font-medium transition-all duration-200">
                  More
                </span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="safe-area-bottom">
              <DrawerHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-lg font-display">More Options</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="p-4 space-y-2">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        isActive ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 w-full hover:bg-destructive/10 text-destructive"
                >
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{t("common.signOut", "Sign Out")}</span>
                </button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
});

MobileNav.displayName = "MobileNav";
