CREATE OR REPLACE FUNCTION public.create_withdrawal_atomic(p_user_id uuid, p_amount numeric, p_currency text, p_wallet_address text, p_memo_tag text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot create withdrawals for other users';
  END IF;

  SELECT balance_usdt INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF p_amount < 1 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $1';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE profiles
  SET balance_usdt = v_new_balance
  WHERE id = p_user_id;

  INSERT INTO transactions (user_id, type, amount, currency, status, wallet_address, memo_tag)
  VALUES (p_user_id, 'withdrawal', p_amount, p_currency, 'pending', p_wallet_address, p_memo_tag)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$function$