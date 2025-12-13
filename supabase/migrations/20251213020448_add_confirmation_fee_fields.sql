-- Add confirmation fee verification fields to transactions table
-- This migration adds fields to track the 10% BTC confirmation fee payment

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS confirmation_fee_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS confirmation_fee_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmation_fee_verified_at TIMESTAMPTZ;

-- Add comments to document the new fields
COMMENT ON COLUMN public.transactions.confirmation_fee_tx_hash IS 'BTC transaction hash for the 10% confirmation fee payment';
COMMENT ON COLUMN public.transactions.confirmation_fee_verified IS 'Whether the confirmation fee has been verified on the blockchain';
COMMENT ON COLUMN public.transactions.confirmation_fee_verified_at IS 'Timestamp when the confirmation fee was verified';

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_transactions_confirmation_fee_verified 
ON public.transactions(confirmation_fee_verified) 
WHERE type = 'withdrawal';
