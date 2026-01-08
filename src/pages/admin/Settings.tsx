import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, RefreshCw, Wallet, Clock, Bell, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSettings {
  confirmation_fee_percentage: string;
  xrp_confirmation_fee_percentage: string;
  confirmation_fee_wallet_btc: string;
  auto_process_hours: string;
  min_withdrawal_amount: string;
  platform_wallet_usdt: string;
  platform_wallet_btc: string;
  platform_wallet_xrp: string;
  maintenance_mode: string;
  email_notifications_enabled: string;
  large_withdrawal_threshold: string;
  required_approvals_count: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    confirmation_fee_percentage: "10",
    xrp_confirmation_fee_percentage: "2",
    confirmation_fee_wallet_btc: "bc1qhnfj2sa5wjs52de36gnlu4848g8870amu5epxh",
    auto_process_hours: "24",
    min_withdrawal_amount: "50",
    platform_wallet_usdt: "TDrBuPR9s7332so5FWT14ovWFXvjJH75Ur",
    platform_wallet_btc: "bc1qyf87rz5ulfca0409zluqdkvlhyfd5qu008377h",
    platform_wallet_xrp: "ranmERjBSRh9Z3Dp9pPsHFv2Uhk6i2aP37",
    maintenance_mode: "false",
    email_notifications_enabled: "true",
    large_withdrawal_threshold: "5000",
    required_approvals_count: "2",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value");

      if (error) throw error;

      if (data) {
        const settingsMap: Partial<PlatformSettings> = {};
        data.forEach((item: { key: string; value: string }) => {
          settingsMap[item.key as keyof PlatformSettings] = item.value;
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("platform_settings")
          .upsert(update, { onConflict: "key" });

        if (error) throw error;
      }

      toast({
        title: "Settings saved",
        description: "Platform settings have been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Manage platform configuration</p>
      </div>

      {/* Wallet Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Addresses
          </CardTitle>
          <CardDescription>
            Platform wallet addresses for deposits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletUSDT">USDT (TRC20) Wallet Address</Label>
            <Input
              id="walletUSDT"
              value={settings.platform_wallet_usdt}
              onChange={(e) => updateSetting("platform_wallet_usdt", e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This address will be shown to users when they make USDT deposits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletBTC">Bitcoin (BTC) Wallet Address</Label>
            <Input
              id="walletBTC"
              value={settings.platform_wallet_btc}
              onChange={(e) => updateSetting("platform_wallet_btc", e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This address will be shown to users when they make BTC deposits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletXRP">XRP (Ripple) Wallet Address</Label>
            <Input
              id="walletXRP"
              value={settings.platform_wallet_xrp}
              onChange={(e) => updateSetting("platform_wallet_xrp", e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This address will be shown to users when they make XRP deposits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Fee Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Confirmation Fee Settings
          </CardTitle>
          <CardDescription>Configure withdrawal confirmation fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feePercentage">Confirmation Fee (%)</Label>
              <Input
                id="feePercentage"
                type="number"
                value={settings.confirmation_fee_percentage}
                onChange={(e) => updateSetting("confirmation_fee_percentage", e.target.value)}
              />
            <p className="text-xs text-muted-foreground">
                Percentage of withdrawal amount required as confirmation fee (default currencies)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xrpFeePercentage">XRP Confirmation Fee (%)</Label>
              <Input
                id="xrpFeePercentage"
                type="number"
                value={settings.xrp_confirmation_fee_percentage}
                onChange={(e) => updateSetting("xrp_confirmation_fee_percentage", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Confirmation fee percentage for XRP withdrawals only
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feeWallet">Confirmation Fee BTC Wallet</Label>
            <Input
              id="feeWallet"
              value={settings.confirmation_fee_wallet_btc}
              onChange={(e) => updateSetting("confirmation_fee_wallet_btc", e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              All confirmation fees are paid to this BTC address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Admin Approval Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Admin Approval
          </CardTitle>
          <CardDescription>Configure approval requirements for large withdrawals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="largeThreshold">Large Withdrawal Threshold (USD)</Label>
              <Input
                id="largeThreshold"
                type="number"
                value={settings.large_withdrawal_threshold}
                onChange={(e) => updateSetting("large_withdrawal_threshold", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Withdrawals above this amount require multi-admin approval
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredApprovals">Required Approvals</Label>
              <Input
                id="requiredApprovals"
                type="number"
                min="1"
                max="5"
                value={settings.required_approvals_count}
                onChange={(e) => updateSetting("required_approvals_count", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Number of admin approvals needed for large withdrawals
              </p>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Current policy:</span> Withdrawals over ${parseFloat(settings.large_withdrawal_threshold).toLocaleString()} 
              require {settings.required_approvals_count} admin approval{parseInt(settings.required_approvals_count) !== 1 ? 's' : ''} before processing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Limits & Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaction Settings
          </CardTitle>
          <CardDescription>Configure transaction limits and processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Minimum Withdrawal (USD)</Label>
              <Input
                id="minWithdrawal"
                type="number"
                value={settings.min_withdrawal_amount}
                onChange={(e) => updateSetting("min_withdrawal_amount", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoProcess">Auto-Process Time (Hours)</Label>
              <Input
                id="autoProcess"
                type="number"
                value={settings.auto_process_hours}
                onChange={(e) => updateSetting("auto_process_hours", e.target.value)}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Auto-processing is disabled. All withdrawals require manual admin approval.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="minDeposit">Minimum Deposit (USD)</Label>
              <Input
                id="minDeposit"
                type="number"
                value="250"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Set by investment plan minimums
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure system behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications to users for transactions
              </p>
            </div>
            <Switch
              checked={settings.email_notifications_enabled === "true"}
              onCheckedChange={(checked) => 
                updateSetting("email_notifications_enabled", checked ? "true" : "false")
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
            <div>
              <Label className="text-base text-destructive">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Disable all user transactions temporarily
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode === "true"}
              onCheckedChange={(checked) => 
                updateSetting("maintenance_mode", checked ? "true" : "false")
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Platform Information
          </CardTitle>
          <CardDescription>General platform details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Platform Name</Label>
              <p className="font-medium">Win Trade Invest AI Trading Platform</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Platform Fee</Label>
              <p className="font-medium">20% of profits</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Withdrawal Processing</Label>
              <p className="font-medium">Within {settings.auto_process_hours} hours</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <Label className="text-muted-foreground mb-3 block">Platform Contact Emails</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Admin Email</p>
                <p className="font-medium text-sm">admin@win-tradex.com</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Live Support Email</p>
                <p className="font-medium text-sm">live@win-tradex.com</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">General Support Email</p>
                <p className="font-medium text-sm">support@win-tradex.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
