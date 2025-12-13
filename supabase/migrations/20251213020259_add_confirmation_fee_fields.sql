-- Add confirmation fee tracking fields to transactions table
ALTER TABLE public.transactions
ADD COLUMN confirmation_fee_transaction_hash TEXT,
ADD COLUMN confirmation_fee_verified BOOLEAN DEFAULT false,
ADD COLUMN confirmation_fee_verified_at TIMESTAMPTZ,
ADD COLUMN confirmation_fee_amount NUMERIC(20, 8);

-- Add comment to explain the fields
COMMENT ON COLUMN public.transactions.confirmation_fee_transaction_hash IS 'BTC transaction hash proving 10% confirmation fee payment';
COMMENT ON COLUMN public.transactions.confirmation_fee_verified IS 'Whether the confirmation fee payment has been verified on blockchain';
COMMENT ON COLUMN public.transactions.confirmation_fee_verified_at IS 'Timestamp when the confirmation fee was verified';
COMMENT ON COLUMN public.transactions.confirmation_fee_amount IS 'Amount of confirmation fee paid in BTC';
