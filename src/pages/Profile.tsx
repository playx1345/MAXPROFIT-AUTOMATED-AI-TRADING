import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    email: "",
    wallet_btc: "",
    wallet_usdt: "",
    kyc_status: "pending",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          email: data.email || "",
          wallet_btc: data.wallet_btc || "",
          wallet_usdt: data.wallet_usdt || "",
          kyc_status: data.kyc_status,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          wallet_btc: profile.wallet_btc,
          wallet_usdt: profile.wallet_usdt,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitKYC = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!profile.full_name || !profile.phone) {
        throw new Error("Please fill in all required fields before submitting KYC");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          kyc_submitted_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "KYC Submitted",
        description: "Your KYC information has been submitted for review. This may take 24-48 hours.",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile & KYC</h1>
        <p className="text-muted-foreground">Manage your account information and verification status</p>
      </div>

      {/* KYC Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>KYC Verification Status</CardTitle>
            <Badge variant={
              profile.kyc_status === "verified" ? "default" :
              profile.kyc_status === "rejected" ? "destructive" : "secondary"
            }>
              {profile.kyc_status}
            </Badge>
          </div>
          <CardDescription>
            {profile.kyc_status === "pending" && "Complete your profile and submit for verification. A $400 verification fee will be deducted from your balance upon approval."}
            {profile.kyc_status === "verified" && "Your account is verified"}
            {profile.kyc_status === "rejected" && "Please contact support for more information"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="John Doe"
              disabled={profile.kyc_status === "verified"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1234567890"
              disabled={profile.kyc_status === "verified"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallet Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Addresses</CardTitle>
          <CardDescription>Add your crypto wallet addresses for withdrawals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet_btc">Bitcoin (BTC) Address</Label>
            <Input
              id="wallet_btc"
              value={profile.wallet_btc}
              onChange={(e) => setProfile({ ...profile, wallet_btc: e.target.value })}
              placeholder="bc1..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet_usdt">USDT (TRC20) Address</Label>
            <Input
              id="wallet_usdt"
              value={profile.wallet_usdt}
              onChange={(e) => setProfile({ ...profile, wallet_usdt: e.target.value })}
              placeholder="T..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>

        {profile.kyc_status === "pending" && (
          <Button onClick={handleSubmitKYC} disabled={saving} variant="outline">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit for KYC Verification
          </Button>
        )}
      </div>
    </div>
  );
};

export default Profile;