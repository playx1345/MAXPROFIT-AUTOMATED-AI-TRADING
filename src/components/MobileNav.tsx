import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Wallet, TrendingUp, ArrowUpRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Wallet, label: "Deposit", path: "/dashboard/deposit" },
  { icon: TrendingUp, label: "Invest", path: "/dashboard/investments" },
  { icon: ArrowUpRight, label: "Withdraw", path: "/dashboard/withdraw" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

export const MobileNav = memo(() => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <div className="bg-card/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl",
                  "transition-all duration-300 min-w-[60px]",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  isActive && "bg-primary/20 scale-110"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "text-primary"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive && "text-primary"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

MobileNav.displayName = "MobileNav";
