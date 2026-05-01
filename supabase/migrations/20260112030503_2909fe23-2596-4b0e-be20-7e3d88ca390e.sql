-- Add memo_tag column to transactions table for XRP withdrawals
ALTER TABLE public.transactions ADD COLUMN memo_tag TEXT;