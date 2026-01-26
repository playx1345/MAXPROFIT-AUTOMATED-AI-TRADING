-- Drop the existing flawed policy
DROP POLICY IF EXISTS "Deny anonymous SELECT on contact_messages" ON public.contact_messages;

-- Create a more secure policy that properly blocks anonymous access
CREATE POLICY "Only authenticated users can view contact_messages"
ON public.contact_messages
FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));