import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PlatformSettings>({
    confirmation_fee_percentage: "10",
    xrp_confirmation_fee_percentage: "2",
    confirmation_fee_wallet_btc: "bc1qx6hnpju7xhznw6lqewvnk5jrn87devagtrhnsv",
    auto_process_hours: "24",
    min_withdrawal_amount: "50",
    platform_wallet_usdt: "TGGJj5ntesS7eCD8mXwxeictvZKFwVTa1E",
    platform_wallet_btc: "bc1qx6hnpju7xhznw6lqewvnk5jrn87devagtrhnsv",
    platform_wallet_xrp: "ranmERjBSRh9Z3Dp9pPsHFv2Uhk6i2aP37",
    maintenance_mode: "false",
    email_notifications_enabled: "true",
    large_withdrawal_threshold: "5000",
    required_approvals_count: "2",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("platform_settings").select("key, value");
      if (error) throw error;
      if (data) {
        const settingsMap: Partial<PlatformSettings> = {};
        data.forEach((item: { key: string; value: string }) => { settingsMap[item.key as keyof PlatformSettings] = item.value; });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast({ title: t('admin.settings.errorLoading'), description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString(), updated_by: user.id }));
      for (const update of updates) {
        const { error } = await supabase.from("platform_settings").upsert(update, { onConflict: "key" });
        if (error) throw error;
      }
      toast({ title: t('admin.settings.settingsSaved'), description: t('admin.settings.settingsSavedDesc') });
    } catch (error: any) {
      toast({ title: t('admin.settings.errorSaving'), description: error.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const updateSetting = (key: keyof PlatformSettings, value: string) => { setSettings(prev => ({ ...prev, [key]: value })); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin" />{t('admin.settings.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.settings.title')}</h1>
        <p className="text-muted-foreground">{t('admin.settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" />{t('admin.settings.walletAddresses')}</CardTitle>
          <CardDescription>{t('admin.settings.walletAddressesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletUSDT">{t('admin.settings.usdtWallet')}</Label>
            <Input id="walletUSDT" value={settings.platform_wallet_usdt} onChange={(e) => updateSetting("platform_wallet_usdt", e.target.value)} className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">{t('admin.settings.usdtWalletNote')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="walletBTC">{t('admin.settings.btcWallet')}</Label>
            <Input id="walletBTC" value={settings.platform_wallet_btc} onChange={(e) => updateSetting("platform_wallet_btc", e.target.value)} className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">{t('admin.settings.btcWalletNote')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="walletXRP">{t('admin.settings.xrpWallet')}</Label>
            <Input id="walletXRP" value={settings.platform_wallet_xrp} onChange={(e) => updateSetting("platform_wallet_xrp", e.target.value)} className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">{t('admin.settings.xrpWalletNote')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />{t('admin.settings.confirmationFeeSettings')}</CardTitle>
          <CardDescription>{t('admin.settings.confirmationFeeDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feePercentage">{t('admin.settings.feePercentage')}</Label>
              <Input id="feePercentage" type="number" value={settings.confirmation_fee_percentage} onChange={(e) => updateSetting("confirmation_fee_percentage", e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('admin.settings.feePercentageNote')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="xrpFeePercentage">{t('admin.settings.xrpFeePercentage')}</Label>
              <Input id="xrpFeePercentage" type="number" value={settings.xrp_confirmation_fee_percentage} onChange={(e) => updateSetting("xrp_confirmation_fee_percentage", e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('admin.settings.xrpFeeNote')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeWallet">{t('admin.settings.feeBtcWallet')}</Label>
            <Input id="feeWallet" value={settings.confirmation_fee_wallet_btc} onChange={(e) => updateSetting("confirmation_fee_wallet_btc", e.target.value)} className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">{t('admin.settings.feeBtcWalletNote')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{t('admin.settings.multiAdminApproval')}</CardTitle>
          <CardDescription>{t('admin.settings.multiAdminDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="largeThreshold">{t('admin.settings.largeThreshold')}</Label>
              <Input id="largeThreshold" type="number" value={settings.large_withdrawal_threshold} onChange={(e) => updateSetting("large_withdrawal_threshold", e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('admin.settings.largeThresholdNote')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredApprovals">{t('admin.settings.requiredApprovals')}</Label>
              <Input id="requiredApprovals" type="number" min="1" max="5" value={settings.required_approvals_count} onChange={(e) => updateSetting("required_approvals_count", e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('admin.settings.requiredApprovalsNote')}</p>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">{t('admin.settings.currentPolicy')}</span> {t('admin.settings.policyText', { threshold: parseFloat(settings.large_withdrawal_threshold).toLocaleString(), count: settings.required_approvals_count })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />{t('admin.settings.transactionSettings')}</CardTitle>
          <CardDescription>{t('admin.settings.transactionSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">{t('admin.settings.minWithdrawal')}</Label>
              <Input id="minWithdrawal" type="number" value={settings.min_withdrawal_amount} onChange={(e) => updateSetting("min_withdrawal_amount", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="autoProcess">{t('admin.settings.autoProcessTime')}</Label>
              <Input id="autoProcess" type="number" value={settings.auto_process_hours} onChange={(e) => updateSetting("auto_process_hours", e.target.value)} disabled />
              <p className="text-xs text-muted-foreground">{t('admin.settings.autoProcessDisabled')}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="minDeposit">{t('admin.settings.minDeposit')}</Label>
              <Input id="minDeposit" type="number" value="250" disabled />
              <p className="text-xs text-muted-foreground">{t('admin.settings.setByPlans')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />{t('admin.settings.systemSettings')}</CardTitle>
          <CardDescription>{t('admin.settings.systemSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <Label className="text-base">{t('admin.settings.emailNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('admin.settings.emailNotificationsDesc')}</p>
            </div>
            <Switch checked={settings.email_notifications_enabled === "true"} onCheckedChange={(checked) => updateSetting("email_notifications_enabled", checked ? "true" : "false")} />
          </div>
          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
            <div>
              <Label className="text-base text-destructive">{t('admin.settings.maintenanceMode')}</Label>
              <p className="text-sm text-muted-foreground">{t('admin.settings.maintenanceModeDesc')}</p>
            </div>
            <Switch checked={settings.maintenance_mode === "true"} onCheckedChange={(checked) => updateSetting("maintenance_mode", checked ? "true" : "false")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" />{t('admin.settings.platformInfo')}</CardTitle>
          <CardDescription>{t('admin.settings.platformInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-muted-foreground">{t('admin.settings.platformName')}</Label><p className="font-medium">{t('admin.settings.platformNameValue')}</p></div>
            <div><Label className="text-muted-foreground">{t('admin.settings.platformFee')}</Label><p className="font-medium">{t('admin.settings.platformFeeValue')}</p></div>
            <div><Label className="text-muted-foreground">{t('admin.settings.withdrawalProcessing')}</Label><p className="font-medium">{t('admin.settings.withinHours', { hours: settings.auto_process_hours })}</p></div>
          </div>
          <div className="pt-4 border-t border-border">
            <Label className="text-muted-foreground mb-3 block">{t('admin.settings.contactEmails')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">{t('admin.settings.adminEmail')}</p><p className="font-medium text-sm">admin@win-tradex.com</p></div>
              <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">{t('admin.settings.liveSupportEmail')}</p><p className="font-medium text-sm">live@win-tradex.com</p></div>
              <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">{t('admin.settings.generalSupportEmail')}</p><p className="font-medium text-sm">support@win-tradex.com</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />{saving ? t('admin.settings.saving') : t('admin.settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
