-- Add DELETE policy for contact messages so admins can delete messages
CREATE POLICY "Admins can delete messages" 
ON public.contact_messages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));
