-- Add explicit deny policy for anonymous/public access to profiles table
-- This ensures unauthenticated users cannot access any profile data even if RLS is misconfigured
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit deny policy for anonymous/public access to transactions table
-- This protects sensitive financial data from unauthenticated access
CREATE POLICY "Deny anonymous access to transactions"
ON public.transactions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit deny policy for anonymous access to user_roles table
-- This prevents privilege escalation attempts from unauthenticated users
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit deny policy for anonymous access to investments table
CREATE POLICY "Deny anonymous access to investments"
ON public.investments
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit deny policy for anonymous access to referrals table
CREATE POLICY "Deny anonymous access to referrals"
ON public.referrals
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit deny policy for anonymous access to admin_activity_logs table
CREATE POLICY "Deny anonymous access to admin_activity_logs"
ON public.admin_activity_logs
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit deny policy for anonymous access to trading_bot_performance table
CREATE POLICY "Deny anonymous access to trading_bot_performance"
ON public.trading_bot_performance
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);