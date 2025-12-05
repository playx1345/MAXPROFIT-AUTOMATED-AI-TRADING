-- Function to verify KYC and deduct fee atomically
-- This function ensures that the KYC verification, balance deduction, and transaction creation
-- happen in a single atomic transaction, preventing race conditions and data inconsistency
CREATE OR REPLACE FUNCTION public.verify_kyc_atomic(
  p_user_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_profile RECORD;
  v_kyc_fee CONSTANT NUMERIC(20, 2) := 400.00;
  v_new_balance NUMERIC(20, 2);
  v_transaction_id UUID;
BEGIN
  -- Verify caller has admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get user profile with row lock to prevent concurrent modifications
  SELECT 
    id, 
    email, 
    balance_usdt, 
    kyc_status, 
    kyc_fee_paid
  INTO v_user_profile
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check if fee has already been paid to prevent duplicate charges
  IF v_user_profile.kyc_fee_paid THEN
    RAISE EXCEPTION 'KYC verification fee has already been deducted for this user';
  END IF;

  -- Validate user has sufficient balance
  IF v_user_profile.balance_usdt IS NULL OR v_user_profile.balance_usdt < v_kyc_fee THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', 
      COALESCE(v_user_profile.balance_usdt, 0), v_kyc_fee;
  END IF;

  -- Calculate new balance
  v_new_balance := v_user_profile.balance_usdt - v_kyc_fee;

  -- Update profile with verified status, fee paid flag, and deduct balance
  UPDATE profiles
  SET 
    kyc_status = 'verified',
    kyc_fee_paid = true,
    balance_usdt = v_new_balance
  WHERE id = p_user_id;

  -- Create fee transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    currency,
    status,
    admin_notes,
    processed_by,
    processed_at
  ) VALUES (
    p_user_id,
    'fee',
    v_kyc_fee,
    'usdt',
    'completed',
    'KYC verification fee',
    p_admin_id,
    NOW()
  )
  RETURNING id INTO v_transaction_id;

  -- Log admin activity
  INSERT INTO admin_activity_logs (
    admin_id,
    admin_email,
    action,
    target_type,
    target_id,
    target_email,
    details
  ) VALUES (
    p_admin_id,
    p_admin_email,
    'kyc_verified',
    'user',
    p_user_id::TEXT,
    v_user_profile.email,
    jsonb_build_object(
      'reason', p_reason,
      'fee_deducted', v_kyc_fee,
      'previous_balance', v_user_profile.balance_usdt,
      'new_balance', v_new_balance,
      'transaction_id', v_transaction_id
    )
  );

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_email', v_user_profile.email,
    'fee_amount', v_kyc_fee,
    'previous_balance', v_user_profile.balance_usdt,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
END;
$$;

-- Grant execute permissions to authenticated users
-- Note: The function itself enforces admin role check
GRANT EXECUTE ON FUNCTION public.verify_kyc_atomic TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.verify_kyc_atomic IS 'Atomically verifies KYC, deducts $400 fee from user balance, and creates transaction record. Prevents race conditions and duplicate charges by using row-level locks and checking kyc_fee_paid flag.';
