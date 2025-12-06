-- Add restrictive policy for authenticated non-admins
-- This ensures only admins can access admin activity logs even if other permissive policies exist
CREATE POLICY "Deny non-admin authenticated access to admin_activity_logs"
ON public.admin_activity_logs
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Prevent any modifications to audit logs (immutable audit trail)
CREATE POLICY "Prevent log modifications"
ON public.admin_activity_logs
AS RESTRICTIVE
FOR UPDATE
USING (false);

-- Prevent any deletions to maintain complete audit history
CREATE POLICY "Prevent log deletions"
ON public.admin_activity_logs
AS RESTRICTIVE
FOR DELETE
USING (false);