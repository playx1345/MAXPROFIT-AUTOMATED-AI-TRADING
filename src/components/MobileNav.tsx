import { memo, useCallback, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, TrendingUp, ArrowUpRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Wallet, label: "Deposit", path: "/dashboard/deposit" },
  { icon: TrendingUp, label: "Invest", path: "/dashboard/investments" },
  { icon: ArrowUpRight, label: "Withdraw", path: "/dashboard/withdraw" },
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
  
  // Swipe gesture state
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [swipeIndicator, setSwipeIndicator] = useState<'left' | 'right' | null>(null);

  const currentIndex = navItems.findIndex(item => item.path === location.pathname);

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
        navigate(navItems[currentIndex - 1].path);
      } else if (deltaX < 0 && currentIndex < navItems.length - 1) {
        // Swipe left - go to next
        triggerHaptic('medium');
        navigate(navItems[currentIndex + 1].path);
      }
    }
  }, [currentIndex, navigate]);

  const handleNavClick = useCallback((path: string) => {
    triggerHaptic('light');
  }, []);

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
              width: `${((currentIndex + 1) / navItems.length) * 100}%`,
              marginLeft: 0
            }}
          />
        </div>
        
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
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
        </div>
        
        {/* Swipe hint text */}
        <div className="text-center pb-1">
          <span className="text-[9px] text-muted-foreground/50">Swipe left or right to navigate</span>
        </div>
      </div>
    </nav>
  );
});

MobileNav.displayName = "MobileNav";
