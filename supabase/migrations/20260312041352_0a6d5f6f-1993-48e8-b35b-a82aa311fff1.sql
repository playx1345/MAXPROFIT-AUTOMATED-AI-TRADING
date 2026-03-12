
CREATE OR REPLACE FUNCTION public.create_withdrawal_atomic(
  p_user_id uuid,
  p_amount numeric,
  p_currency text,
  p_wallet_address text,
  p_memo_tag text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Authorization check: User can only create withdrawals for themselves
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot create withdrawals for other users';
  END IF;

  -- Get user's current balance with lock
  SELECT balance_usdt INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF p_amount < 10 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $10';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Deduct from balance
  UPDATE profiles
  SET balance_usdt = v_new_balance
  WHERE id = p_user_id;

  -- Create withdrawal transaction
  INSERT INTO transactions (user_id, type, amount, currency, status, wallet_address, memo_tag)
  VALUES (p_user_id, 'withdrawal', p_amount, p_currency, 'pending', p_wallet_address, p_memo_tag)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$;
