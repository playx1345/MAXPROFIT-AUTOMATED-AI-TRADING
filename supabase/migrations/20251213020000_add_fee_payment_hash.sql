-- =====================================================
-- Add fee payment hash field for withdrawal fee confirmation
-- =====================================================
-- This migration adds a field to track the transaction hash
-- of the 10% fee payment that users must submit before
-- their withdrawal can be processed.
-- =====================================================

-- Add fee_payment_hash column to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS fee_payment_hash TEXT;

COMMENT ON COLUMN public.transactions.fee_payment_hash IS 'Transaction hash of the 10% confirmation fee payment submitted by user for withdrawals';
