-- Migration: Add atomic transaction functions for investment creation, deposit approval, and withdrawal approval
-- This prevents race conditions by executing all operations within a single database transaction

-- Function to create an investment atomically
-- This function ensures that the investment is created and the balance is deducted in a single atomic transaction
CREATE OR REPLACE FUNCTION public.create_investment_atomic(
  p_user_id UUID,
  p_plan_id UUID,
  p_amount_usdt NUMERIC(20, 2)
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_balance NUMERIC(20, 2);
  v_plan RECORD;
  v_investment_id UUID;
  v_new_balance NUMERIC(20, 2);
BEGIN
  -- Get user's current balance with row lock to prevent concurrent modifications
  SELECT balance_usdt INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Validate user has sufficient balance
  IF v_user_balance < p_amount_usdt THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_user_balance, p_amount_usdt;
  END IF;

  -- Get plan details with row lock
  SELECT * INTO v_plan
  FROM investment_plans
  WHERE id = p_plan_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Investment plan not found or inactive';
  END IF;

  -- Validate amount is within plan limits
  IF p_amount_usdt < v_plan.min_amount OR p_amount_usdt > v_plan.max_amount THEN
    RAISE EXCEPTION 'Amount must be between % and %', v_plan.min_amount, v_plan.max_amount;
  END IF;

  -- Calculate new balance
  v_new_balance := v_user_balance - p_amount_usdt;

  -- Create the investment
  INSERT INTO investments (
    user_id,
    plan_id,
    amount_usdt,
    current_value,
    status,
    roi_percentage,
    started_at,
    ends_at
  ) VALUES (
    p_user_id,
    p_plan_id,
    p_amount_usdt,
    p_amount_usdt,
    'active',
    0.0000,
    NOW(),
    NOW() + (v_plan.duration_days || ' days')::INTERVAL
  )
  RETURNING id INTO v_investment_id;

  -- Deduct from user balance
  UPDATE profiles
  SET balance_usdt = v_new_balance
  WHERE id = p_user_id;

  -- Return success response with investment details
  RETURN jsonb_build_object(
    'success', true,
    'investment_id', v_investment_id,
    'amount', p_amount_usdt,
    'new_balance', v_new_balance,
    'plan_name', v_plan.name
  );
END;
$$;

-- Function to approve a deposit atomically
-- This function ensures that the transaction status is updated and the balance is credited in a single atomic transaction
CREATE OR REPLACE FUNCTION public.approve_deposit_atomic(
  p_transaction_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction RECORD;
  v_user_balance NUMERIC(20, 2);
  v_new_balance NUMERIC(20, 2);
  v_user_email TEXT;
BEGIN
  -- Verify caller has admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get transaction details with row lock to prevent concurrent processing
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Validate transaction is a deposit
  IF v_transaction.type != 'deposit' THEN
    RAISE EXCEPTION 'Transaction is not a deposit';
  END IF;

  -- Validate transaction is pending
  IF v_transaction.status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending. Current status: %', v_transaction.status;
  END IF;

  -- Get user's current balance with row lock
  SELECT balance_usdt, email INTO v_user_balance, v_user_email
  FROM profiles
  WHERE id = v_transaction.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Calculate new balance
  v_new_balance := v_user_balance + v_transaction.amount;

  -- Update transaction status to completed
  UPDATE transactions
  SET 
    status = 'completed',
    admin_notes = p_admin_notes,
    processed_by = p_admin_id,
    processed_at = NOW()
  WHERE id = p_transaction_id;

  -- Credit user balance
  UPDATE profiles
  SET balance_usdt = v_new_balance
  WHERE id = v_transaction.user_id;

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
    'deposit_approved',
    'transaction',
    p_transaction_id::TEXT,
    v_user_email,
    jsonb_build_object(
      'amount', v_transaction.amount,
      'currency', v_transaction.currency,
      'admin_notes', p_admin_notes,
      'previous_balance', v_user_balance,
      'new_balance', v_new_balance
    )
  );

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'amount', v_transaction.amount,
    'previous_balance', v_user_balance,
    'new_balance', v_new_balance,
    'user_email', v_user_email
  );
END;
$$;

-- Function to approve a withdrawal atomically
-- This function ensures that the balance is debited and the transaction status is updated in a single atomic transaction
CREATE OR REPLACE FUNCTION public.approve_withdrawal_atomic(
  p_transaction_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_transaction_hash TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction RECORD;
  v_user_balance NUMERIC(20, 2);
  v_new_balance NUMERIC(20, 2);
  v_user_email TEXT;
BEGIN
  -- Verify caller has admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get transaction details with row lock to prevent concurrent processing
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Validate transaction is a withdrawal
  IF v_transaction.type != 'withdrawal' THEN
    RAISE EXCEPTION 'Transaction is not a withdrawal';
  END IF;

  -- Validate transaction is pending
  IF v_transaction.status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending. Current status: %', v_transaction.status;
  END IF;

  -- Get user's current balance with row lock
  SELECT balance_usdt, email INTO v_user_balance, v_user_email
  FROM profiles
  WHERE id = v_transaction.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Validate user has sufficient balance
  IF v_user_balance < v_transaction.amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_user_balance, v_transaction.amount;
  END IF;

  -- Calculate new balance
  v_new_balance := v_user_balance - v_transaction.amount;

  -- Deduct from user balance
  UPDATE profiles
  SET balance_usdt = v_new_balance
  WHERE id = v_transaction.user_id;

  -- Update transaction status to completed
  UPDATE transactions
  SET 
    status = 'completed',
    admin_notes = p_admin_notes,
    transaction_hash = p_transaction_hash,
    processed_by = p_admin_id,
    processed_at = NOW()
  WHERE id = p_transaction_id;

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
    'withdrawal_approved',
    'transaction',
    p_transaction_id::TEXT,
    v_user_email,
    jsonb_build_object(
      'amount', v_transaction.amount,
      'currency', v_transaction.currency,
      'transaction_hash', p_transaction_hash,
      'admin_notes', p_admin_notes,
      'previous_balance', v_user_balance,
      'new_balance', v_new_balance
    )
  );

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'amount', v_transaction.amount,
    'previous_balance', v_user_balance,
    'new_balance', v_new_balance,
    'user_email', v_user_email
  );
END;
$$;

-- Function to reject a deposit atomically
CREATE OR REPLACE FUNCTION public.reject_deposit_atomic(
  p_transaction_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction RECORD;
  v_user_email TEXT;
BEGIN
  -- Verify caller has admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get transaction details with row lock
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Validate transaction is a deposit
  IF v_transaction.type != 'deposit' THEN
    RAISE EXCEPTION 'Transaction is not a deposit';
  END IF;

  -- Validate transaction is pending
  IF v_transaction.status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending. Current status: %', v_transaction.status;
  END IF;

  -- Get user email
  SELECT email INTO v_user_email
  FROM profiles
  WHERE id = v_transaction.user_id;

  -- Update transaction status to rejected
  UPDATE transactions
  SET 
    status = 'rejected',
    admin_notes = p_admin_notes,
    processed_by = p_admin_id,
    processed_at = NOW()
  WHERE id = p_transaction_id;

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
    'deposit_rejected',
    'transaction',
    p_transaction_id::TEXT,
    v_user_email,
    jsonb_build_object(
      'amount', v_transaction.amount,
      'currency', v_transaction.currency,
      'admin_notes', p_admin_notes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'user_email', v_user_email
  );
END;
$$;

-- Function to reject a withdrawal atomically
CREATE OR REPLACE FUNCTION public.reject_withdrawal_atomic(
  p_transaction_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction RECORD;
  v_user_email TEXT;
BEGIN
  -- Verify caller has admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get transaction details with row lock
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Validate transaction is a withdrawal
  IF v_transaction.type != 'withdrawal' THEN
    RAISE EXCEPTION 'Transaction is not a withdrawal';
  END IF;

  -- Validate transaction is pending
  IF v_transaction.status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending. Current status: %', v_transaction.status;
  END IF;

  -- Get user email
  SELECT email INTO v_user_email
  FROM profiles
  WHERE id = v_transaction.user_id;

  -- Update transaction status to rejected
  UPDATE transactions
  SET 
    status = 'rejected',
    admin_notes = p_admin_notes,
    processed_by = p_admin_id,
    processed_at = NOW()
  WHERE id = p_transaction_id;

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
    'withdrawal_rejected',
    'transaction',
    p_transaction_id::TEXT,
    v_user_email,
    jsonb_build_object(
      'amount', v_transaction.amount,
      'currency', v_transaction.currency,
      'admin_notes', p_admin_notes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'user_email', v_user_email
  );
END;
$$;

-- Grant execute permissions
-- Only authenticated users can create investments (for their own account)
GRANT EXECUTE ON FUNCTION public.create_investment_atomic TO authenticated;

-- Only admins can approve/reject deposits and withdrawals
-- Note: The functions themselves should verify admin role via has_role() check

-- Revoke from authenticated first to be explicit
REVOKE EXECUTE ON FUNCTION public.approve_deposit_atomic FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.approve_withdrawal_atomic FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.reject_deposit_atomic FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.reject_withdrawal_atomic FROM authenticated;

-- Grant to authenticated (required for function execution context)
-- Admin role check will be enforced within the function
GRANT EXECUTE ON FUNCTION public.approve_deposit_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_withdrawal_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_deposit_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_withdrawal_atomic TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.create_investment_atomic IS 'Atomically creates an investment and deducts the amount from user balance. Prevents race conditions by using row-level locks.';
COMMENT ON FUNCTION public.approve_deposit_atomic IS 'Atomically approves a deposit and credits user balance. Prevents race conditions by using row-level locks.';
COMMENT ON FUNCTION public.approve_withdrawal_atomic IS 'Atomically approves a withdrawal and debits user balance. Prevents race conditions by using row-level locks.';
COMMENT ON FUNCTION public.reject_deposit_atomic IS 'Atomically rejects a deposit transaction.';
COMMENT ON FUNCTION public.reject_withdrawal_atomic IS 'Atomically rejects a withdrawal transaction.';
