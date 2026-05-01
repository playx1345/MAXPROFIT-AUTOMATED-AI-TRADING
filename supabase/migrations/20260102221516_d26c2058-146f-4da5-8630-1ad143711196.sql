-- Add ETH and USDC wallet columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_eth text,
ADD COLUMN IF NOT EXISTS wallet_usdc text;