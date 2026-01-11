import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
  ArrowLeftRight,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/admin/login");
    }
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
    { path: "/admin/deposits", label: "Deposits", icon: ArrowDownLeft },
    { path: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpRight },
    { path: "/admin/reversals", label: "Reversals", icon: RotateCcw },
    { path: "/admin/investments", label: "Investments", icon: TrendingUp },
    { path: "/admin/trading-bot", label: "Trading Bot", icon: Bot },
    { path: "/admin/activity-log", label: "Activity Log", icon: Activity },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Menu Button with Glass Effect */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden glass-card border border-primary/20 hover:border-primary/40 hover:shadow-glow backdrop-blur-lg transition-all duration-300 hover:scale-110 active:scale-95"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="text-primary" /> : <Menu className="text-primary" />}
      </Button>

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
            <div className="flex items-center gap-2 relative">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shadow-elegant">
                <Shield className="h-6 w-6 text-primary-foreground drop-shadow-glow" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-gradient-premium">Admin Panel</h1>
                <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border border-accent/30">
                  Win Trade Invest
                </Badge>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
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
                  >
                    {/* Active indicator with glow */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-accent" />
                    )}
                    
                    {/* Hover effect background with glass */}
                    <span className={`absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm ${isActive ? 'opacity-0' : ''}`} />
                    
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary relative",
                      isActive && "drop-shadow-glow"
                    )} />
                    <span className="relative font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-primary/10 bg-gradient-to-t from-background/40 to-transparent">
            <Button
              variant="ghost"
              className="w-full justify-start group hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:shadow-md border border-transparent hover:border-destructive/20"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:-translate-x-1 group-hover:rotate-12" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
