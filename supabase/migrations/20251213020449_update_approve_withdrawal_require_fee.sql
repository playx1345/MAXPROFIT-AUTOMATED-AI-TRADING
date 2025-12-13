-- Update approve_withdrawal_atomic to require confirmation fee verification
-- This ensures that withdrawals can only be approved after the 10% BTC fee is verified

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

  -- Check if confirmation fee has been verified (required for withdrawals)
  IF v_transaction.confirmation_fee_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Confirmation fee must be verified before approving withdrawal. Please verify the 10%% BTC payment first.';
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
      'confirmation_fee_verified', true,
      'confirmation_fee_tx_hash', v_transaction.confirmation_fee_tx_hash
    ));

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_transaction.amount
  );
END;
$$;

COMMENT ON FUNCTION public.approve_withdrawal_atomic IS 'Atomically approves a withdrawal after verifying the 10% BTC confirmation fee has been paid. Prevents race conditions by using row-level locks.';
