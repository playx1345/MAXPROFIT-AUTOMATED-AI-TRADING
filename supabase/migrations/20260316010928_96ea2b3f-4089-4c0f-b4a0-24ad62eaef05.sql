
CREATE OR REPLACE FUNCTION public.reject_withdrawal_no_refund(
  p_transaction_id uuid,
  p_admin_id uuid,
  p_admin_email text,
  p_admin_notes text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction RECORD;
  v_user_balance NUMERIC;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  IF p_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Admin ID mismatch';
  END IF;

  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'withdrawal' AND status = 'pending'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  SELECT balance_usdt INTO v_user_balance
  FROM profiles WHERE id = v_transaction.user_id;

  UPDATE transactions
  SET status = 'rejected',
      processed_by = p_admin_id,
      processed_at = NOW(),
      admin_notes = COALESCE(admin_notes || ' | ', '') || 'FORFEITED: ' || COALESCE(p_admin_notes, 'No reason provided')
  WHERE id = p_transaction_id;

  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (p_admin_id, p_admin_email, 'withdrawal_forfeited', 'transaction', p_transaction_id::TEXT,
    jsonb_build_object(
      'amount', v_transaction.amount,
      'user_id', v_transaction.user_id,
      'reason', p_admin_notes,
      'balance_unchanged', v_user_balance,
      'note', 'Balance NOT refunded - funds forfeited'
    ));

  RETURN jsonb_build_object(
    'success', true,
    'forfeited_amount', v_transaction.amount,
    'balance_unchanged', v_user_balance
  );
END;
$$;
