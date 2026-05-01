-- Create withdrawal_approvals table to track multi-admin approvals
CREATE TABLE public.withdrawal_approvals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL,
    admin_email TEXT NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    UNIQUE (transaction_id, admin_id)
);

-- Enable RLS
ALTER TABLE public.withdrawal_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for withdrawal_approvals
CREATE POLICY "Admins can view all withdrawal approvals"
ON public.withdrawal_approvals
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert withdrawal approvals"
ON public.withdrawal_approvals
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete withdrawal approvals"
ON public.withdrawal_approvals
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anonymous access to withdrawal_approvals"
ON public.withdrawal_approvals
FOR ALL
USING (false);

-- Add platform settings for approval thresholds if they don't exist
INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('large_withdrawal_threshold', '5000', 'Amount threshold (USD) above which multi-admin approval is required'),
    ('required_approvals_count', '2', 'Number of admin approvals required for large withdrawals')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX idx_withdrawal_approvals_transaction_id ON public.withdrawal_approvals(transaction_id);