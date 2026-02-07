import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock } from "lucide-react";
import { z } from "zod";
import { PasswordInput } from "@/components/ui/password-input";
import { useRateLimit } from "@/hooks/useRateLimit";
import logo from "@/assets/logo.jpg";
import { LanguageSelector } from "@/components/LanguageSelector";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const { isBlocked, remainingTime, checkRateLimit, recordAttempt, formatRemainingTime } = useRateLimit({
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000,
    storageKey: "admin_password_reset_rate_limit",
  });

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const type = searchParams.get("type");
    if (type === "recovery" && accessToken) setShowResetPassword(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") setShowResetPassword(true);
    });
    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Authentication failed");
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", { _user_id: authData.user.id, _role: "admin" });
      if (roleError) throw roleError;
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({ title: t('admin.login.accessDenied'), description: t('admin.login.noAdminPrivileges'), variant: "destructive" });
        return;
      }
      toast({ title: t('admin.login.loginSuccess'), description: t('admin.login.loginSuccessDesc') });
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast({ title: t('admin.login.loginFailed'), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { allowed, waitTime } = checkRateLimit();
    if (!allowed) {
      toast({ title: t('admin.login.tooManyAttempts'), description: t('admin.login.waitBeforeRetry', { time: formatRemainingTime(waitTime) }), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      emailSchema.parse(resetEmail);
      recordAttempt();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/admin/login?type=recovery` });
      if (error) throw error;
      toast({ title: t('admin.login.resetEmailSent'), description: t('admin.login.resetEmailSentDesc') });
      setResetEmail("");
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({ title: t('admin.login.resetFailed'), description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      passwordSchema.parse(newPassword);
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      if (user?.email) {
        try { await supabase.functions.invoke("send-password-reset-confirmation", { body: { email: user.email, isAdmin: true } }); } catch (emailError) { console.error("Failed to send confirmation email:", emailError); }
      }
      toast({ title: t('admin.login.passwordUpdated'), description: t('admin.login.passwordUpdatedDesc') });
      await supabase.auth.signOut();
      setShowResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, document.title, "/admin/login");
    } catch (error: any) {
      toast({ title: t('admin.login.passwordUpdateFailed'), description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Live Win Trade" className="h-16 w-16 rounded-full object-cover shadow-lg" />
            </div>
            <CardTitle className="text-2xl">{t('admin.login.setNewPassword')}</CardTitle>
            <CardDescription>{t('admin.login.setNewPasswordSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('admin.login.newPassword')}</Label>
                <PasswordInput id="new-password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required showStrengthIndicator />
                <p className="text-xs text-muted-foreground">{t('admin.login.minChars')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('admin.login.confirmPassword')}</Label>
                <PasswordInput id="confirm-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? t('admin.login.updating') : t('admin.login.updatePassword')}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Live Win Trade" className="h-16 w-16 rounded-full object-cover shadow-lg" />
            </div>
            <CardTitle className="text-2xl">{t('admin.login.resetTitle')}</CardTitle>
            <CardDescription>{t('admin.login.resetSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t('admin.login.email')}</Label>
                <Input id="reset-email" type="email" placeholder={t('admin.login.emailPlaceholder')} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
              </div>
              {isBlocked && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{t('admin.login.tooManyAttemptsWait', { time: formatRemainingTime(remainingTime) })}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading || isBlocked}>{loading ? t('admin.login.sendingReset') : t('admin.login.sendResetLink')}</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />{t('admin.login.backToSignIn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Live Win Trade" className="h-16 w-16 rounded-full object-cover shadow-lg" />
          </div>
          <div className="flex justify-center mb-2"><LanguageSelector /></div>
          <CardTitle className="text-2xl">{t('admin.login.title')}</CardTitle>
          <CardDescription>{t('admin.login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('admin.login.email')}</Label>
              <Input id="email" type="email" placeholder={t('admin.login.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('admin.login.password')}</Label>
              <PasswordInput id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="button" variant="link" onClick={() => setShowForgotPassword(true)} className="text-sm p-0 h-auto text-primary hover:text-primary/80">
                {t('admin.login.forgotPassword')}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? t('admin.login.signingIn') : t('admin.login.signIn')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
