-- Update approve_withdrawal_atomic to require confirmation fee verification
CREATE OR REPLACE FUNCTION public.approve_withdrawal_atomic(
  p_transaction_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_transaction_hash TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction RECORD;
BEGIN
  -- Get and lock the transaction
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'withdrawal' AND status = 'pending'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Check if confirmation fee has been verified
  IF NOT v_transaction.confirmation_fee_verified THEN
    RAISE EXCEPTION 'Cannot approve withdrawal: 10%% confirmation fee has not been verified. User must pay the confirmation fee to the BTC address before withdrawal can be approved.';
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
    jsonb_build_object(
      'amount', v_transaction.amount, 
      'user_id', v_transaction.user_id, 
      'tx_hash', p_transaction_hash,
      'confirmation_fee_verified', v_transaction.confirmation_fee_verified,
      'confirmation_fee_tx_hash', v_transaction.confirmation_fee_transaction_hash,
      'confirmation_fee_amount_btc', v_transaction.confirmation_fee_amount
    ));

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_transaction.amount
  );
END;
$$;

COMMENT ON FUNCTION public.approve_withdrawal_atomic IS 'Atomically approves a withdrawal after verifying the 10% confirmation fee has been paid. Requires confirmation_fee_verified to be true.';
