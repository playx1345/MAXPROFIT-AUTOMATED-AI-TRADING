import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save } from "lucide-react";

const AdminSettings = () => {
  const [walletUSDT, setWalletUSDT] = useState("TYourPlatformUSDTAddress123456789");
  const [walletBTC, setWalletBTC] = useState("bc1YourPlatformBTCAddress123456789");
  const [minWithdrawal, setMinWithdrawal] = useState("50");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate save - in production this would update platform_settings table
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Platform settings have been updated successfully",
      });
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Manage platform configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
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
              value={walletUSDT}
              onChange={(e) => setWalletUSDT(e.target.value)}
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
              value={walletBTC}
              onChange={(e) => setWalletBTC(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This address will be shown to users when they make BTC deposits
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Limits</CardTitle>
          <CardDescription>Configure minimum and maximum transaction amounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Minimum Withdrawal (USD)</Label>
              <Input
                id="minWithdrawal"
                type="number"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
              />
            </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
          <CardDescription>General platform details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Platform Name</Label>
              <p className="font-medium">Max Forex & Automated Trading Robot</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Support Email</Label>
              <p className="font-medium">maxforexautomatedforexroboti@gmail.com</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Platform Fee</Label>
              <p className="font-medium">20% of profits</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Withdrawal Processing</Label>
              <p className="font-medium">Within 24 hours</p>
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
