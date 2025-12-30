-- Add 'processing' status to transaction_status enum
ALTER TYPE public.transaction_status ADD VALUE IF NOT EXISTS 'processing';

-- Note: The actual user creation for SHAWN SPICER must be done through Supabase Auth
-- This migration will create a function to initialize the user's profile with test data
-- once they are created via the Supabase Dashboard or sign up flow

-- Create a function to set up Shawn Spicer's account when the user signs up
-- This function should be called manually after the user is created via Supabase Auth
CREATE OR REPLACE FUNCTION public.setup_shawn_spicer_account(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_exists BOOLEAN;
  v_transaction_id UUID;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RAISE EXCEPTION 'User profile not found. User must be created in Supabase Auth first.';
  END IF;

  -- Update the profile with balance of $15000
  UPDATE profiles
  SET balance_usdt = 15000.00,
      full_name = 'SHAWN SPICER',
      kyc_status = 'verified'
  WHERE id = p_user_id;

  -- Create a sample deposit transaction with "processing" status
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    currency,
    status,
    wallet_address,
    admin_notes
  )
  VALUES (
    p_user_id,
    'deposit',
    5000.00,
    'usdt',
    'processing',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    'Processing - Waiting for block confirmation'
  )
  RETURNING id INTO v_transaction_id;

  -- Create another sample deposit transaction with "processing" status
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    currency,
    status,
    wallet_address,
    admin_notes
  )
  VALUES (
    p_user_id,
    'deposit',
    10000.00,
    'usdt',
    'processing',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    'Processing - Waiting for block confirmation'
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'balance', 15000.00,
    'transactions_created', 2
  );
END;
$$;

-- Comment explaining the setup process
COMMENT ON FUNCTION public.setup_shawn_spicer_account IS 
'Function to initialize Shawn Spicer account with $15000 balance and processing transactions. 
Call this function after creating the user SHAWNSPICER55@GMAIL.COM via Supabase Auth:
SELECT public.setup_shawn_spicer_account(''<user_id>'');';
