import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { emailSchema, passwordSchema, signInPasswordSchema, fullNameSchema, validateField } from "@/lib/validation";
import { Shield, Zap, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const type = searchParams.get("type");
    
    if (type === "recovery" && accessToken) {
      setShowResetPassword(true);
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !showResetPassword) {
        navigate("/dashboard");
      }
    };
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowResetPassword(true);
      } else if (event === "SIGNED_IN" && !showResetPassword) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams, showResetPassword]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const emailValidation = validateField(emailSchema, signUpData.email);
      const passwordValidation = validateField(passwordSchema, signUpData.password);
      const nameValidation = validateField(fullNameSchema, signUpData.fullName);

      const newErrors: Record<string, string> = {};
      if (!emailValidation.isValid) newErrors.email = emailValidation.error;
      if (!passwordValidation.isValid) newErrors.password = passwordValidation.error;
      if (!nameValidation.isValid) newErrors.fullName = nameValidation.error;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error("Please fix the validation errors");
      }

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created successfully!",
          description: "You can now sign in to your account.",
        });
        setSignUpData({ email: "", password: "", fullName: "" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign up";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const emailValidation = validateField(emailSchema, signInData.email);
      const passwordValidation = validateField(signInPasswordSchema, signInData.password);

      const newErrors: Record<string, string> = {};
      if (!emailValidation.isValid) newErrors.signInEmail = emailValidation.error;
      if (!passwordValidation.isValid) newErrors.signInPassword = passwordValidation.error;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error("Please fix the validation errors");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password";
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const emailValidation = validateField(emailSchema, resetEmail);
      if (!emailValidation.isValid) {
        setErrors({ resetEmail: emailValidation.error });
        throw new Error("Please enter a valid email address");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent!",
        description: "Check your email for a link to reset your password.",
      });
      setResetEmail("");
      setShowForgotPassword(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully!",
        description: "You can now sign in with your new password.",
      });
      
      await supabase.auth.signOut();
      setShowResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      
      window.history.replaceState({}, document.title, "/auth");
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

  if (showResetPassword) {
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
            <img src={logo} alt="Live Win Trade" className="w-24 h-24 rounded-2xl shadow-xl shadow-primary/25 mb-4 mx-auto object-cover" />
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Live Win Trade
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
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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
                  <Input
                    id="confirm-password"
                    type="password"
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
  }

  if (showForgotPassword) {
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
            <img src={logo} alt="Live Win Trade" className="w-24 h-24 rounded-2xl shadow-xl shadow-primary/25 mb-4 mx-auto object-cover" />
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Live Win Trade
            </h1>
          </div>

          <Card className="glass-card-enhanced border-primary/20 shadow-2xl shadow-primary/10 animate-scale-in">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="text-2xl font-display font-semibold text-foreground">
                Reset Password
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-foreground font-medium">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className={`bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200 ${errors.resetEmail ? "border-destructive" : ""}`}
                  />
                  {errors.resetEmail && (
                    <p className="text-xs text-destructive">{errors.resetEmail}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.2),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <img src={logo} alt="Live Win Trade" className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-xl shadow-primary/25 mb-3 sm:mb-4 mx-auto object-cover border-2 border-primary/20" />
          <h1 className="text-2xl sm:text-3xl font-serif font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent tracking-wide">
            Live Win Trade
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">AI-Powered Investment Platform</p>
        </div>

        {/* Main auth card */}
        <Card className="backdrop-blur-xl bg-card/80 border border-primary/30 shadow-2xl shadow-primary/20 animate-scale-in rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <CardHeader className="text-center space-y-2 pb-4 pt-6 sm:pt-8 relative">
            <CardTitle className="text-xl sm:text-2xl font-serif font-semibold text-foreground tracking-wide">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="relative px-4 sm:px-6 pb-6 sm:pb-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 border border-border/30 rounded-xl p-1 h-auto">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif font-medium rounded-lg py-2.5 text-sm sm:text-base transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif font-medium rounded-lg py-2.5 text-sm sm:text-base transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="animate-fade-in">
                <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-5 mt-5 sm:mt-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signin-email" className="text-foreground font-serif font-medium text-sm sm:text-base">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                      className={`bg-background/60 border-border/40 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base rounded-xl ${errors.signInEmail ? "border-destructive" : ""}`}
                    />
                    {errors.signInEmail && (
                      <p className="text-xs text-destructive">{errors.signInEmail}</p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signin-password" className="text-foreground font-serif font-medium text-sm sm:text-base">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      className={`bg-background/60 border-border/40 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base rounded-xl ${errors.signInPassword ? "border-destructive" : ""}`}
                    />
                    {errors.signInPassword && (
                      <p className="text-xs text-destructive">{errors.signInPassword}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs sm:text-sm text-primary hover:text-primary/80 hover:underline transition-colors font-serif"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-serif font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] rounded-xl text-sm sm:text-base" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in">
                <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5 mt-5 sm:mt-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signup-name" className="text-foreground font-serif font-medium text-sm sm:text-base">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                      className={`bg-background/60 border-border/40 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base rounded-xl ${errors.fullName ? "border-destructive" : ""}`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground font-serif font-medium text-sm sm:text-base">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      className={`bg-background/60 border-border/40 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base rounded-xl ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground font-serif font-medium text-sm sm:text-base">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className={`bg-background/60 border-border/40 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base rounded-xl ${errors.password ? "border-destructive" : ""}`}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-serif">Min 8 chars with uppercase, lowercase, and number</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-serif font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] rounded-xl text-sm sm:text-base" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/30">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-serif">Secure</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-serif">Fast</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-serif">Profitable</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6 animate-fade-in font-serif px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;