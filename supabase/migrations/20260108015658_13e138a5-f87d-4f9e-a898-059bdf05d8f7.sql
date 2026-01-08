
-- Function to reverse an approved deposit (deduct from balance, mark as rejected)
CREATE OR REPLACE FUNCTION public.reverse_approved_deposit(
  p_transaction_id uuid,
  p_admin_id uuid,
  p_admin_email text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- Authorization check
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  -- Get and lock the transaction
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'deposit' AND status = 'approved'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Approved deposit not found';
  END IF;

  -- Deduct from user balance
  UPDATE profiles
  SET balance_usdt = balance_usdt - v_transaction.amount
  WHERE id = v_transaction.user_id
  RETURNING balance_usdt INTO v_new_balance;

  -- Update transaction status
  UPDATE transactions
  SET status = 'rejected',
      admin_notes = COALESCE(admin_notes || ' | ', '') || 'REVERSED: ' || COALESCE(p_reason, 'No reason provided'),
      processed_by = p_admin_id,
      processed_at = NOW()
  WHERE id = p_transaction_id;

  -- Log action
  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'reverse_deposit', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id, 'reason', p_reason, 'new_balance', v_new_balance));

  RETURN jsonb_build_object('success', true, 'amount', v_transaction.amount, 'new_balance', v_new_balance);
END;
$$;

-- Function to reverse an approved withdrawal (refund to balance, mark as rejected)
CREATE OR REPLACE FUNCTION public.reverse_approved_withdrawal(
  p_transaction_id uuid,
  p_admin_id uuid,
  p_admin_email text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction RECORD;
  v_new_balance NUMERIC;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'withdrawal' AND status = 'approved'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Approved withdrawal not found';
  END IF;

  -- Refund to user balance
  UPDATE profiles
  SET balance_usdt = balance_usdt + v_transaction.amount
  WHERE id = v_transaction.user_id
  RETURNING balance_usdt INTO v_new_balance;

  UPDATE transactions
  SET status = 'rejected',
      admin_notes = COALESCE(admin_notes || ' | ', '') || 'REVERSED: ' || COALESCE(p_reason, 'No reason provided'),
      processed_by = p_admin_id,
      processed_at = NOW()
  WHERE id = p_transaction_id;

  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'reverse_withdrawal', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id, 'reason', p_reason, 'new_balance', v_new_balance));

  RETURN jsonb_build_object('success', true, 'amount', v_transaction.amount, 'new_balance', v_new_balance);
END;
$$;

-- Function to reopen a rejected deposit (credit balance, mark as approved)
CREATE OR REPLACE FUNCTION public.reopen_rejected_deposit(
  p_transaction_id uuid,
  p_admin_id uuid,
  p_admin_email text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction RECORD;
  v_new_balance NUMERIC;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'deposit' AND status = 'rejected'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Rejected deposit not found';
  END IF;

  -- Credit user balance
  UPDATE profiles
  SET balance_usdt = balance_usdt + v_transaction.amount
  WHERE id = v_transaction.user_id
  RETURNING balance_usdt INTO v_new_balance;

  UPDATE transactions
  SET status = 'approved',
      admin_notes = COALESCE(admin_notes || ' | ', '') || 'REOPENED: ' || COALESCE(p_reason, 'No reason provided'),
      processed_by = p_admin_id,
      processed_at = NOW()
  WHERE id = p_transaction_id;

  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'reopen_deposit', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id, 'reason', p_reason, 'new_balance', v_new_balance));

  RETURN jsonb_build_object('success', true, 'amount', v_transaction.amount, 'new_balance', v_new_balance);
END;
$$;

-- Function to reopen a rejected withdrawal (debit balance, mark as approved)
CREATE OR REPLACE FUNCTION public.reopen_rejected_withdrawal(
  p_transaction_id uuid,
  p_admin_id uuid,
  p_admin_email text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction RECORD;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'withdrawal' AND status = 'rejected'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Rejected withdrawal not found';
  END IF;

  -- Check user balance
  SELECT balance_usdt INTO v_current_balance
  FROM profiles WHERE id = v_transaction.user_id FOR UPDATE;

  IF v_current_balance < v_transaction.amount THEN
    RAISE EXCEPTION 'User has insufficient balance to reopen this withdrawal';
  END IF;

  -- Debit balance
  UPDATE profiles
  SET balance_usdt = balance_usdt - v_transaction.amount
  WHERE id = v_transaction.user_id
  RETURNING balance_usdt INTO v_new_balance;

  UPDATE transactions
  SET status = 'approved',
      admin_notes = COALESCE(admin_notes || ' | ', '') || 'REOPENED: ' || COALESCE(p_reason, 'No reason provided'),
      processed_by = p_admin_id,
      processed_at = NOW()
  WHERE id = p_transaction_id;

  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'reopen_withdrawal', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object('amount', v_transaction.amount, 'user_id', v_transaction.user_id, 'reason', p_reason, 'new_balance', v_new_balance));

  RETURN jsonb_build_object('success', true, 'amount', v_transaction.amount, 'new_balance', v_new_balance);
END;
$$;

-- Function to adjust user balance directly
CREATE OR REPLACE FUNCTION public.adjust_user_balance(
  p_user_id uuid,
  p_admin_id uuid,
  p_admin_email text,
  p_amount numeric,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_user_email TEXT;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  IF p_reason IS NULL OR p_reason = '' THEN
    RAISE EXCEPTION 'Reason is required for balance adjustment';
  END IF;

  SELECT balance_usdt, email INTO v_current_balance, v_user_email
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  v_new_balance := v_current_balance + p_amount;

  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Balance cannot go negative';
  END IF;

  UPDATE profiles SET balance_usdt = v_new_balance WHERE id = p_user_id;

  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, status, admin_notes, processed_by, processed_at)
  VALUES (
    p_user_id,
    CASE WHEN p_amount >= 0 THEN 'deposit' ELSE 'withdrawal' END,
    ABS(p_amount),
    'approved',
    'Admin adjustment: ' || p_reason,
    p_admin_id,
    NOW()
  );

  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, target_email, details)
  VALUES (p_admin_id, p_admin_email, 'adjust_balance', 'user', p_user_id::TEXT, v_user_email,
    jsonb_build_object('previous_balance', v_current_balance, 'adjustment', p_amount, 'new_balance', v_new_balance, 'reason', p_reason));

  RETURN jsonb_build_object('success', true, 'previous_balance', v_current_balance, 'new_balance', v_new_balance);
END;
$$;
