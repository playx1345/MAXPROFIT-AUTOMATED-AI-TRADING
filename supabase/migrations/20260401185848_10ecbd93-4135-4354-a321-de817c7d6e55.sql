
-- Create user_restrictions table
CREATE TABLE public.user_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  restriction_type TEXT NOT NULL DEFAULT 'withdrawal_deadline',
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL,
  admin_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can view all restrictions"
ON public.user_restrictions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert restrictions"
ON public.user_restrictions FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update restrictions"
ON public.user_restrictions FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete restrictions"
ON public.user_restrictions FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- User policy - view own active restrictions
CREATE POLICY "Users can view own active restrictions"
ON public.user_restrictions FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND status = 'active');

-- Deny anonymous
CREATE POLICY "Deny anonymous access"
ON public.user_restrictions FOR ALL
TO anon
USING (false);

-- Index for quick lookups
CREATE INDEX idx_user_restrictions_user_status ON public.user_restrictions (user_id, status);
CREATE INDEX idx_user_restrictions_deadline ON public.user_restrictions (deadline) WHERE status = 'active';
