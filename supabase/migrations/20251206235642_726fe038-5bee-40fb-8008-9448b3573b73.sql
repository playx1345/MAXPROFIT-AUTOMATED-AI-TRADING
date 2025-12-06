-- Add in-function authorization checks to all SECURITY DEFINER atomic functions

-- Update create_investment_atomic to verify user is creating investment for themselves
CREATE OR REPLACE FUNCTION public.create_investment_atomic(p_user_id uuid, p_plan_id uuid, p_amount_usdt numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance NUMERIC;
  v_plan RECORD;
  v_investment_id UUID;
  v_ends_at TIMESTAMPTZ;
BEGIN
  -- Authorization check: User can only create investments for themselves
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot create investments for other users';
  END IF;

  -- Get user's current balance
  SELECT balance_usdt INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_current_balance < p_amount_usdt THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Get plan details
  SELECT * INTO v_plan
  FROM investment_plans
  WHERE id = p_plan_id AND active = true;

  IF v_plan IS NULL THEN
    RAISE EXCEPTION 'Investment plan not found or inactive';
  END IF;

  IF p_amount_usdt < v_plan.min_amount OR p_amount_usdt > v_plan.max_amount THEN
    RAISE EXCEPTION 'Amount outside plan limits';
  END IF;

  -- Calculate end date
  v_ends_at := NOW() + (v_plan.duration_days || ' days')::INTERVAL;

  -- Deduct from balance
  UPDATE profiles
  SET balance_usdt = balance_usdt - p_amount_usdt
  WHERE id = p_user_id;

  -- Create investment
  INSERT INTO investments (user_id, plan_id, amount_usdt, status, current_value, started_at, ends_at)
  VALUES (p_user_id, p_plan_id, p_amount_usdt, 'active', p_amount_usdt, NOW(), v_ends_at)
  RETURNING id INTO v_investment_id;

  RETURN jsonb_build_object(
    'success', true,
    'investment_id', v_investment_id,
    'new_balance', v_current_balance - p_amount_usdt
  );
END;
$function$;

-- Update approve_deposit_atomic to verify admin role
CREATE OR REPLACE FUNCTION public.approve_deposit_atomic(p_transaction_id uuid, p_admin_id uuid, p_admin_email text, p_admin_notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_transaction RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- Authorization check: Only admins can approve deposits
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Verify provided admin_id matches authenticated user
  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  -- Get and lock the transaction
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'deposit' AND status = 'pending'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET status = 'approved',
      processed_by = p_admin_id,
      processed_at = NOW(),
      admin_notes = COALESCE(p_admin_notes, admin_notes)
  WHERE id = p_transaction_id;

  -- Credit user's balance
  UPDATE profiles
  SET balance_usdt = balance_usdt + v_transaction.amount
  WHERE id = v_transaction.user_id
  RETURNING balance_usdt INTO v_new_balance;

  -- Log admin action
  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'approve_deposit', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id));

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_transaction.amount,
    'new_balance', v_new_balance
  );
END;
$function$;

-- Update reject_deposit_atomic to verify admin role
CREATE OR REPLACE FUNCTION public.reject_deposit_atomic(p_transaction_id uuid, p_admin_id uuid, p_admin_email text, p_admin_notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_transaction RECORD;
BEGIN
  -- Authorization check: Only admins can reject deposits
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Verify provided admin_id matches authenticated user
  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  -- Get and lock the transaction
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'deposit' AND status = 'pending'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET status = 'rejected',
      processed_by = p_admin_id,
      processed_at = NOW(),
      admin_notes = COALESCE(p_admin_notes, admin_notes)
  WHERE id = p_transaction_id;

  -- Log admin action
  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'reject_deposit', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id, 'reason', p_admin_notes));

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- Update approve_withdrawal_atomic to verify admin role
CREATE OR REPLACE FUNCTION public.approve_withdrawal_atomic(p_transaction_id uuid, p_admin_id uuid, p_admin_email text, p_transaction_hash text DEFAULT NULL::text, p_admin_notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_transaction RECORD;
BEGIN
  -- Authorization check: Only admins can approve withdrawals
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Verify provided admin_id matches authenticated user
  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  -- Get and lock the transaction
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'withdrawal' AND status = 'pending'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET status = 'approved',
      processed_by = p_admin_id,
      processed_at = NOW(),
      transaction_hash = COALESCE(p_transaction_hash, transaction_hash),
      admin_notes = COALESCE(p_admin_notes, admin_notes)
  WHERE id = p_transaction_id;

  -- Log admin action
  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'approve_withdrawal', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id, 'tx_hash', p_transaction_hash));

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_transaction.amount
  );
END;
$function$;

-- Update reject_withdrawal_atomic to verify admin role
CREATE OR REPLACE FUNCTION public.reject_withdrawal_atomic(p_transaction_id uuid, p_admin_id uuid, p_admin_email text, p_admin_notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_transaction RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- Authorization check: Only admins can reject withdrawals
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Verify provided admin_id matches authenticated user
  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  -- Get and lock the transaction
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'withdrawal' AND status = 'pending'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET status = 'rejected',
      processed_by = p_admin_id,
      processed_at = NOW(),
      admin_notes = COALESCE(p_admin_notes, admin_notes)
  WHERE id = p_transaction_id;

  -- Refund the amount back to user's balance
  UPDATE profiles
  SET balance_usdt = balance_usdt + v_transaction.amount
  WHERE id = v_transaction.user_id
  RETURNING balance_usdt INTO v_new_balance;

  -- Log admin action
  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'reject_withdrawal', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id, 'reason', p_admin_notes, 'refunded_balance', v_new_balance));

  RETURN jsonb_build_object(
    'success', true,
    'refunded_amount', v_transaction.amount,
    'new_balance', v_new_balance
  );
END;
$function$;

-- Update verify_kyc_atomic to verify admin role
CREATE OR REPLACE FUNCTION public.verify_kyc_atomic(p_user_id uuid, p_admin_id uuid, p_admin_email text, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance NUMERIC;
  v_fee_amount NUMERIC := 400.00;
  v_new_balance NUMERIC;
  v_user_email TEXT;
BEGIN
  -- Authorization check: Only admins can verify KYC
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Verify provided admin_id matches authenticated user
  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  -- Get user's current balance and email
  SELECT balance_usdt, email INTO v_current_balance, v_user_email
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if user has enough balance for fee
  IF v_current_balance < v_fee_amount THEN
    RAISE EXCEPTION 'Insufficient balance for KYC fee ($400 required)';
  END IF;

  -- Deduct fee from balance
  v_new_balance := v_current_balance - v_fee_amount;
  UPDATE profiles
  SET balance_usdt = v_new_balance,
      kyc_status = 'verified'
  WHERE id = p_user_id;

  -- Create fee transaction record
  INSERT INTO transactions (user_id, type, amount, status, admin_notes, processed_by, processed_at)
  VALUES (p_user_id, 'withdrawal', v_fee_amount, 'approved', 'KYC verification fee', p_admin_id, NOW());

  -- Log admin action
  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, target_email, details)
  VALUES (p_admin_id, p_admin_email, 'verify_kyc', 'user', p_user_id::TEXT, v_user_email,
    jsonb_build_object('fee_amount', v_fee_amount, 'new_balance', v_new_balance, 'reason', p_reason));

  RETURN jsonb_build_object(
    'success', true,
    'fee_amount', v_fee_amount,
    'new_balance', v_new_balance
  );
END;
$function$;