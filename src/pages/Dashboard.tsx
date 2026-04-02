import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Sparkline } from "@/components/ui/sparkline";
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SecurityBadge } from "@/components/ui/security-badge";
import { PullToRefresh } from "@/components/PullToRefresh";
import { AccountRestrictionFeeDialog } from "@/components/AccountRestrictionFeeDialog";
import { WithdrawalRestrictionBanner } from "@/components/WithdrawalRestrictionBanner";
import { DepositRequirementDialog } from "@/components/DepositRequirementDialog";


interface DashboardStats {
  balance: number;
  totalInvested: number;
  totalProfit: number;
  activeInvestments: number;
}

interface ProfileData {
  kyc_status: string;
  full_name: string | null;
  phone: string | null;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    totalInvested: 0,
    totalProfit: 0,
    activeInvestments: 0,
  });
  const [profile, setProfile] = useState<ProfileData>({
    kyc_status: "pending",
    full_name: null,
    phone: null,
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [showActivationFee, setShowActivationFee] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [depositRestriction, setDepositRestriction] = useState<{id: string; deadline: string; message: string | null} | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("balance_usdt, kyc_status, full_name, phone")
        .eq("id", user.id)
        .single();

      // Fetch investments
      const { data: investments } = await supabase
        .from("investments")
        .select("amount_usdt, current_value, status")
        .eq("user_id", user.id);

      // Fetch recent transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount_usdt), 0) || 0;
      const totalValue = investments?.reduce((sum, inv) => sum + Number(inv.current_value), 0) || 0;
      const activeCount = investments?.filter(inv => inv.status === "active").length || 0;

      setStats({
        balance: Number(profileData?.balance_usdt) || 0,
        totalInvested,
        totalProfit: totalValue - totalInvested,
        activeInvestments: activeCount,
      });

      setProfile({
        kyc_status: profileData?.kyc_status || "pending",
        full_name: profileData?.full_name || null,
        phone: profileData?.phone || null,
      });

      setRecentTransactions(transactions || []);

      // Check for activation fee requirement
      const hasActivationFee = transactions?.some(
        (tx: any) => tx.admin_notes?.includes("ACTIVATION FEE REQUIRED")
      );
      setShowActivationFee(!!hasActivationFee);

      // Check for deposit_required restriction
      const { data: depositRestrictions } = await supabase
        .from("user_restrictions")
        .select("id, deadline, message")
        .eq("user_id", user.id)
        .eq("restriction_type", "deposit_required")
        .eq("status", "active")
        .limit(1);

      if (depositRestrictions && depositRestrictions.length > 0) {
        setDepositRestriction(depositRestrictions[0]);
      } else {
        setDepositRestriction(null);
      }
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 100);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);




  const statsCards = useMemo(() => [
    {
      title: t("dashboard.totalBalance", "Available Balance"),
      icon: Wallet,
      value: stats.balance,
      prefix: "$",
      suffix: "",
      description: "USDT",
      colorClass: "text-primary",
      iconBgClass: "bg-primary/10",
      borderClass: "border-primary/30",
    },
    {
      title: t("dashboard.totalInvested", "Total Invested"),
      icon: ArrowDownLeft,
      value: stats.totalInvested,
      prefix: "$",
      suffix: "",
      description: t("dashboard.acrossInvestments", "Across all investments"),
      colorClass: "text-accent",
      iconBgClass: "bg-accent/10",
      borderClass: "border-accent/30",
    },
    {
      title: t("dashboard.totalProfit", "Total Profit/Loss"),
      icon: TrendingUp,
      value: stats.totalProfit,
      prefix: "$",
      suffix: "",
      description: `${stats.totalProfit >= 0 ? "+" : ""}${stats.totalInvested > 0 ? ((stats.totalProfit / stats.totalInvested) * 100).toFixed(2) : "0.00"}%`,
      colorClass: stats.totalProfit >= 0 ? "text-success" : "text-destructive",
      iconBgClass: stats.totalProfit >= 0 ? "bg-success/10" : "bg-destructive/10",
      borderClass: stats.totalProfit >= 0 ? "border-success/30" : "border-destructive/30",
    },
    {
      title: t("dashboard.activeInvestments", "Active Investments"),
      icon: ArrowUpRight,
      value: stats.activeInvestments,
      prefix: "",
      suffix: "",
      description: t("dashboard.currentlyRunning", "Currently running"),
      colorClass: "text-primary-glow",
      iconBgClass: "bg-primary-glow/10",
      borderClass: "border-primary-glow/30",
      isInteger: true,
    },
  ], [stats, t]);

  // Generate mock sparkline data for demonstration
  const sparklineData = useMemo(() => ({
    balance: Array.from({ length: 10 }, () => Math.random() * 1000 + 500),
    invested: Array.from({ length: 10 }, () => Math.random() * 2000 + 1000),
    profit: Array.from({ length: 10 }, (_, i) => i * 50 + Math.random() * 100),
    active: Array.from({ length: 10 }, () => Math.floor(Math.random() * 5) + 1),
  }), []);

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted skeleton-shimmer" />
          <div className="h-4 w-72 rounded-md bg-muted skeleton-shimmer" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} variant="glass" className="overflow-hidden border-border/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
                <div className="h-3 w-24 rounded bg-muted skeleton-shimmer" />
                <div className="h-9 w-9 rounded-xl bg-muted skeleton-shimmer" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-7 w-28 rounded bg-muted skeleton-shimmer mb-2" />
                <div className="h-3 w-16 rounded bg-muted skeleton-shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* KYC card skeleton */}
        <Card className="glass-card-enhanced border-border/50">
          <CardHeader>
            <div className="h-5 w-52 rounded bg-muted skeleton-shimmer" />
            <div className="h-3 w-64 rounded bg-muted skeleton-shimmer mt-2" />
          </CardHeader>
        </Card>

        {/* Transactions skeleton */}
        <Card className="glass-card-enhanced border-border/50">
          <CardHeader>
            <div className="h-5 w-44 rounded bg-muted skeleton-shimmer" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-xl bg-muted skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-muted skeleton-shimmer" />
                  <div className="h-3 w-20 rounded bg-muted skeleton-shimmer" />
                </div>
                <div className="h-4 w-16 rounded bg-muted skeleton-shimmer" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={fetchData}>
    <div className="space-y-6 pb-20 md:pb-6">
      <AccountRestrictionFeeDialog open={showActivationFee} userId={currentUserId} />
      {depositRestriction && currentUserId && (
        <DepositRequirementDialog restriction={depositRestriction} userId={currentUserId} />
      )}
      <WithdrawalRestrictionBanner />

      {/* Header with fade-in animation */}
      <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 font-heading bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              {t("dashboard.title", "Dashboard")}
            </h1>
            <p className="text-muted-foreground font-body">{t("dashboard.welcome", "Welcome to your investment dashboard")}</p>
          </div>
          <SecurityBadge variant="shield" label="Account Secured" />
        </div>
      </div>

      {/* Stats Cards with sparklines - Enhanced mobile grid */}
      <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.totalBalance", "Available Balance")}
          icon={Wallet}
          value={stats.balance}
          prefix="$"
          description="USDT"
          colorClass="text-primary"
          iconBgClass="bg-primary/10"
          borderClass="border-primary/30"
          sparklineData={sparklineData.balance}
          mounted={mounted}
          delay={0}
        />
        <StatCard
          title={t("dashboard.totalInvested", "Total Invested")}
          icon={ArrowDownLeft}
          value={stats.totalInvested}
          prefix="$"
          description={t("dashboard.acrossInvestments", "Across all investments")}
          colorClass="text-accent"
          iconBgClass="bg-accent/10"
          borderClass="border-accent/30"
          sparklineData={sparklineData.invested}
          mounted={mounted}
          delay={100}
        />
        <StatCard
          title={t("dashboard.totalProfit", "Total Profit/Loss")}
          icon={TrendingUp}
          value={stats.totalProfit}
          prefix="$"
          description={`${stats.totalProfit >= 0 ? "+" : ""}${stats.totalInvested > 0 ? ((stats.totalProfit / stats.totalInvested) * 100).toFixed(2) : "0.00"}%`}
          colorClass={stats.totalProfit >= 0 ? "text-success" : "text-destructive"}
          iconBgClass={stats.totalProfit >= 0 ? "bg-success/10" : "bg-destructive/10"}
          borderClass={stats.totalProfit >= 0 ? "border-success/30" : "border-destructive/30"}
          trend={stats.totalInvested > 0 ? (stats.totalProfit / stats.totalInvested) * 100 : 0}
          sparklineData={sparklineData.profit}
          mounted={mounted}
          delay={200}
        />
        <StatCard
          title={t("dashboard.activeInvestments", "Active Investments")}
          icon={ArrowUpRight}
          value={stats.activeInvestments}
          prefix=""
          description={t("dashboard.currentlyRunning", "Currently running")}
          colorClass="text-primary-glow"
          iconBgClass="bg-primary-glow/10"
          borderClass="border-primary-glow/30"
          isInteger
          sparklineData={sparklineData.active}
          mounted={mounted}
          delay={300}
        />
      </div>

      {/* KYC Status Card */}
      <Card className={`glass-card-enhanced border-border/50 transition-all duration-500 delay-200 hover:shadow-none hover:scale-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-heading">
              {t("dashboard.kycStatus", "KYC Verification Status")}
            </CardTitle>
            <CardDescription className="mt-1">
              {profile.kyc_status === "pending" && "Complete your profile to start verification"}
              {profile.kyc_status === "verified" && "Your account is verified"}
              {profile.kyc_status === "rejected" && "Please contact support for more information"}
            </CardDescription>
          </div>
          <Badge variant={
            profile.kyc_status === "verified" ? "default" :
            profile.kyc_status === "rejected" ? "destructive" : "secondary"
          }>
            {profile.kyc_status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.kyc_status === "pending" && !profile.full_name && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete your profile information to enable KYC verification. 
                <Link to="/dashboard/profile" className="text-primary hover:underline ml-1 font-medium">
                  Go to Profile
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          {profile.kyc_status === "pending" && profile.full_name && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your profile is complete. KYC verification is pending admin review.
              </p>
              <Link to="/dashboard/profile">
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>
            </div>
          )}
          
          {profile.kyc_status === "verified" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <AlertCircle className="h-4 w-4" />
              <span>Your account is fully verified</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions with slide-in animation */}
      <Card className={`glass-card-enhanced border-border/50 transition-all duration-500 delay-500 hover:shadow-none hover:scale-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-heading">
            <span className="relative">
              {t("dashboard.recentTransactions", "Recent Transactions")}
              <span className="absolute -right-3 -top-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-bounce">
                <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">{t("dashboard.noTransactions", "No transactions yet")}</p>
              <p className="text-sm text-muted-foreground/70 mt-1">{t("dashboard.transactionsWillAppear", "Your transactions will appear here")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div 
                  key={tx.id} 
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/30 pb-3 last:border-0 group hover:bg-muted/20 rounded-lg px-3 py-2 -mx-3 transition-all duration-300 ${
                    mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      tx.type === 'deposit' ? 'bg-success/10' : 
                      tx.type === 'withdrawal' ? 'bg-destructive/10' : 'bg-primary/10'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="h-5 w-5 text-success" />
                      ) : tx.type === 'withdrawal' ? (
                        <ArrowUpRight className="h-5 w-5 text-destructive" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium capitalize truncate">{tx.type.replace("_", " ")}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right pl-13 sm:pl-0">
                    <div className="font-bold font-heading text-base sm:text-sm">${Number(tx.amount).toFixed(2)}</div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block whitespace-nowrap ${
                      tx.status === "completed" ? "bg-success/10 text-success" :
                      tx.status === "pending" ? "bg-warning/10 text-warning" :
                      tx.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      tx.status === "approved" ? "bg-primary/10 text-primary" : ""
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </PullToRefresh>
  );
};

export default Dashboard;
