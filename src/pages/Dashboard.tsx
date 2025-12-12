import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Loader2, Upload, FileText, Eye, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { KYC_DOCUMENTS_BUCKET, extractKycFilePath, getKycDocumentSignedUrl } from "@/lib/kyc-utils";

interface DashboardStats {
  balance: number;
  totalInvested: number;
  totalProfit: number;
  activeInvestments: number;
}

interface ProfileData {
  kyc_status: string;
  kyc_id_card_url: string | null;
  full_name: string | null;
  phone: string | null;
}

const Dashboard = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    totalInvested: 0,
    totalProfit: 0,
    activeInvestments: 0,
  });
  const [profile, setProfile] = useState<ProfileData>({
    kyc_status: "pending",
    kyc_id_card_url: null,
    full_name: null,
    phone: null,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("balance_usdt, kyc_status, kyc_id_card_url, full_name, phone")
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
          kyc_id_card_url: profileData?.kyc_id_card_url || null,
          full_name: profileData?.full_name || null,
          phone: profileData?.phone || null,
        });

        setRecentTransactions(transactions || []);
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
    };

    fetchData();
  }, [toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, WEBP, or PDF file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete old file if exists
      if (profile.kyc_id_card_url) {
        try {
          const oldPath = extractKycFilePath(profile.kyc_id_card_url);
          if (oldPath) {
            await supabase.storage
              .from(KYC_DOCUMENTS_BUCKET)
              .remove([oldPath]);
          }
        } catch (error) {
          console.error('Failed to delete old KYC document:', error);
        }
      }

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `id-card-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(KYC_DOCUMENTS_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store the file path
      const storedValue = `${KYC_DOCUMENTS_BUCKET}/${filePath}`;

      // Update profile with file path
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ kyc_id_card_url: storedValue })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, kyc_id_card_url: storedValue });

      toast({
        title: "ID card uploaded",
        description: "Your ID card has been uploaded successfully",
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewIdCard = async () => {
    if (!profile.kyc_id_card_url) return;
    
    try {
      const signedUrl = await getKycDocumentSignedUrl(profile.kyc_id_card_url);
      
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast({
          title: "Error",
          description: "Invalid file path",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error viewing document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const statsCards = useMemo(() => [
    {
      title: "Available Balance",
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
      title: "Total Invested",
      icon: ArrowDownLeft,
      value: stats.totalInvested,
      prefix: "$",
      suffix: "",
      description: "Across all investments",
      colorClass: "text-accent",
      iconBgClass: "bg-accent/10",
      borderClass: "border-accent/30",
    },
    {
      title: "Total Profit/Loss",
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
      title: "Active Investments",
      icon: ArrowUpRight,
      value: stats.activeInvestments,
      prefix: "",
      suffix: "",
      description: "Currently running",
      colorClass: "text-primary-glow",
      iconBgClass: "bg-primary-glow/10",
      borderClass: "border-primary-glow/30",
      isInteger: true,
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
        </div>
        <div className="animate-pulse text-muted-foreground font-medium">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with fade-in animation */}
      <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-3xl font-bold mb-2 font-display bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome to your investment dashboard</p>
      </div>

      {/* Stats Cards with staggered animations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`group relative overflow-hidden transition-all duration-500 glass-card-enhanced ${card.borderClass} hover:shadow-none hover:scale-100 ${
                mounted 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`p-2.5 rounded-xl ${card.iconBgClass} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`h-4 w-4 ${card.colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold font-display ${card.colorClass}`}>
                  {card.isInteger ? (
                    <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix} decimals={0} />
                  ) : (
                    <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KYC Status and ID Upload Card */}
      <Card className={`glass-card-enhanced border-border/50 transition-all duration-500 delay-200 hover:shadow-none hover:scale-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-display">
              KYC Verification Status
            </CardTitle>
            <CardDescription className="mt-1">
              {profile.kyc_status === "pending" && !profile.kyc_id_card_url && "Upload your ID card to start verification"}
              {profile.kyc_status === "pending" && profile.kyc_id_card_url && "ID uploaded. Complete your profile to submit for verification"}
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
          
          {profile.kyc_status !== "verified" && (
            <div className="space-y-2">
              <Label htmlFor="id_card_upload">ID Card / Passport</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="id_card_upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                {profile.kyc_id_card_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleViewIdCard}
                    title="View uploaded ID card"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
              {profile.kyc_id_card_url && !uploading && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>ID card uploaded</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a clear photo of your government-issued ID card or passport (JPG, PNG, WEBP, or PDF, max 5MB)
              </p>
              {profile.kyc_id_card_url && profile.full_name && (
                <div className="pt-2">
                  <Link to="/dashboard/profile">
                    <Button variant="outline" className="w-full">
                      Complete KYC Verification
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {profile.kyc_status === "verified" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <FileText className="h-4 w-4" />
              <span>Your account is fully verified</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions with slide-in animation */}
      <Card className={`glass-card-enhanced border-border/50 transition-all duration-500 delay-500 hover:shadow-none hover:scale-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <span className="relative">
              Recent Transactions
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
              <p className="text-muted-foreground font-medium">No transactions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between border-b border-border/30 pb-3 last:border-0 group hover:bg-muted/20 rounded-lg px-3 py-2 -mx-3 transition-all duration-300 ${
                    mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
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
                    <div>
                      <div className="font-medium capitalize">{tx.type.replace("_", " ")}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-display">${Number(tx.amount).toFixed(2)}</div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
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
  );
};

export default Dashboard;
