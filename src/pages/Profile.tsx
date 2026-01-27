import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Eye } from "lucide-react";
import { KYC_DOCUMENTS_BUCKET, extractKycFilePath, getKycDocumentSignedUrl } from "@/lib/kyc-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PullToRefresh } from "@/components/PullToRefresh";

const KYC_FEE_AMOUNT = 400;

const Profile = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    email: "",
    wallet_btc: "",
    wallet_usdt: "",
    wallet_eth: "",
    wallet_usdc: "",
    kyc_status: "pending",
  });
  const [kycIdCardUrl, setKycIdCardUrl] = useState("");

  const fetchProfile = useCallback(async () => {
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
          wallet_eth: data.wallet_eth || "",
          wallet_usdc: data.wallet_usdc || "",
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
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
          wallet_eth: profile.wallet_eth,
          wallet_usdc: profile.wallet_usdc,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!profile.full_name || !profile.phone) {
        toast({
          title: "Submission failed",
          description: "Please fill in all required fields before submitting KYC",
          variant: "destructive",
        });
        return;
      }

      if (!kycIdCardUrl) {
        toast({
          title: "Submission failed",
          description: "Please upload your ID card before submitting KYC",
          variant: "destructive",
        });
        return;
      }

      // Show confirmation dialog
      setShowKycDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmKycSubmission = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      setShowKycDialog(false);
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
      if (kycIdCardUrl) {
        try {
          const oldPath = extractKycFilePath(kycIdCardUrl);
          if (oldPath) {
            await supabase.storage
              .from(KYC_DOCUMENTS_BUCKET)
              .remove([oldPath]);
          }
        } catch (error) {
          // Log but don't fail if deletion fails
          console.error('Failed to delete old file:', error);
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

      // Store the file path instead of URL for better security
      // The file can be accessed via signed URLs when needed
      const storedValue = `${KYC_DOCUMENTS_BUCKET}/${filePath}`;

      // Store locally (KYC ID card is managed via storage, not in profiles table)
      setKycIdCardUrl(storedValue);

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
    if (!kycIdCardUrl) return;
    
    try {
      const signedUrl = await getKycDocumentSignedUrl(kycIdCardUrl);
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={fetchProfile}>
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
            {profile.kyc_status === "pending" && `Complete your profile and submit for verification. A $${KYC_FEE_AMOUNT} verification fee will be deducted from your balance upon approval.`}
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

          <div className="space-y-2">
            <Label htmlFor="id_card">ID Card / Passport *</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id="id_card"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading || profile.kyc_status === "verified"}
                className="flex-1"
              />
              {kycIdCardUrl && (
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
            {kycIdCardUrl && !uploading && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>ID card uploaded</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Upload a clear photo of your government-issued ID card or passport (JPG, PNG, WEBP, or PDF, max 5MB)
            </p>
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

          <div className="space-y-2">
            <Label htmlFor="wallet_eth">Ethereum (ETH) Address</Label>
            <Input
              id="wallet_eth"
              value={profile.wallet_eth}
              onChange={(e) => setProfile({ ...profile, wallet_eth: e.target.value })}
              placeholder="0x..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet_usdc">USDC (ERC20) Address</Label>
            <Input
              id="wallet_usdc"
              value={profile.wallet_usdc}
              onChange={(e) => setProfile({ ...profile, wallet_usdc: e.target.value })}
              placeholder="0x..."
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

      {/* KYC Fee Confirmation Dialog */}
      <AlertDialog open={showKycDialog} onOpenChange={setShowKycDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>KYC Verification Fee</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Please confirm that you understand the following:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>A one-time verification fee of <strong>${KYC_FEE_AMOUNT}</strong> will be deducted from your account balance upon KYC approval.</li>
                <li>This fee is non-refundable.</li>
                <li>The verification process may take 24-48 hours.</li>
              </ul>
              <p className="mt-2">
                Do you wish to proceed with your KYC submission?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmKycSubmission} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Submission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PullToRefresh>
  );
};

export default Profile;