import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalBonus: number;
  pendingBonus: number;
}

interface Referral {
  id: string;
  created_at: string;
  bonus_amount: number;
  bonus_paid: boolean;
  referred: {
    email: string;
  };
}

const Referrals = () => {
  const [userId, setUserId] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalBonus: 0,
    pendingBonus: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Fetch referrals
      const { data: referralData, error: referralError } = await supabase
        .from("referrals")
        .select(`
          id,
          created_at,
          bonus_amount,
          bonus_paid,
          referred:profiles!referrals_referred_id_fkey(email)
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralError) throw referralError;

      const referralsList = referralData || [];
      setReferrals(referralsList as any);

      // Calculate stats
      const totalReferrals = referralsList.length;
      const activeReferrals = referralsList.filter((r) => r.bonus_paid).length;
      const totalBonus = referralsList
        .filter((r) => r.bonus_paid)
        .reduce((sum, r) => sum + r.bonus_amount, 0);
      const pendingBonus = referralsList
        .filter((r) => !r.bonus_paid)
        .reduce((sum, r) => sum + r.bonus_amount, 0);

      setStats({
        totalReferrals,
        activeReferrals,
        totalBonus,
        pendingBonus,
      });
    } catch (error: any) {
      toast({
        title: "Error fetching referral data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}/auth?ref=${userId}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Join Win Trade Invest AI Trading Platform and start investing in crypto! Use my referral link: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading referrals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">Earn bonuses by referring friends</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeReferrals}</div>
            <p className="text-xs text-muted-foreground">Who made deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats.totalBonus.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Bonus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${stats.pendingBonus.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link with friends and earn 5% of their first deposit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button size="icon" variant="outline" onClick={copyReferralLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={shareWhatsApp}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">How it works:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Share your unique referral link with friends</li>
              <li>• They sign up using your link</li>
              <li>• When they make their first deposit, you earn 5% bonus</li>
              <li>• Bonuses are credited to your account automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>People who signed up using your link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {referral.referred?.email?.replace(/(.{3}).*(@.*)/, "$1***$2") || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {format(new Date(referral.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${referral.bonus_amount.toFixed(2)}</p>
                    <Badge
                      className={
                        referral.bonus_paid ? "bg-green-500" : "bg-yellow-500"
                      }
                    >
                      {referral.bonus_paid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Referrals;
