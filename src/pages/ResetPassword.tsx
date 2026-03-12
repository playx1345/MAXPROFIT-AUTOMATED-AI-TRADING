import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { passwordSchema, validateField } from "@/lib/validation";
import { PasswordInput } from "@/components/ui/password-input";
import logo from "@/assets/wtx-logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery session via hash params or auth event
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");

    if (type === "recovery") {
      setReady(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if there's already a session (user clicked reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const passwordValidation = validateField(passwordSchema, newPassword);
      if (!passwordValidation.isValid) {
        setErrors({ newPassword: passwordValidation.error });
        throw new Error("Please enter a valid password");
      }

      if (newPassword !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        throw new Error("Passwords do not match");
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Send confirmation email
      if (user?.email) {
        try {
          await supabase.functions.invoke("send-password-reset-confirmation", {
            body: { email: user.email, isAdmin: false },
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      toast({
        title: "Password updated successfully!",
        description: "You can now sign in with your new password.",
      });

      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Password update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Verifying reset link...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.2),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <img src={logo} alt="Win-Tradex" className="w-24 h-24 rounded-2xl shadow-xl shadow-primary/25 mb-4 mx-auto object-contain" />
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Win-Tradex
          </h1>
        </div>

        <Card className="glass-card-enhanced border-primary/20 shadow-2xl shadow-primary/10 animate-scale-in">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-display font-semibold text-foreground">
              Set New Password
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground font-medium">New Password</Label>
                <PasswordInput
                  id="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  showStrengthIndicator
                  className={`bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200 ${errors.newPassword ? "border-destructive" : ""}`}
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground font-medium">Confirm Password</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
