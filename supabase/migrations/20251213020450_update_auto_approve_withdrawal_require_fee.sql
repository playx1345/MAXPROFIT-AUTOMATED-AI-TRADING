-- Update auto_approve_withdrawal to require confirmation fee verification
-- This ensures that even automatic approvals require the 10% BTC fee to be verified

CREATE OR REPLACE FUNCTION public.auto_approve_withdrawal(p_transaction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction RECORD;
  v_current_balance NUMERIC;
BEGIN
  -- Get and lock the transaction
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND type = 'withdrawal' AND status = 'pending'
  FOR UPDATE;

  IF v_transaction IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Check if 24 hours have passed
  IF v_transaction.created_at > NOW() - INTERVAL '24 hours' THEN
    RAISE EXCEPTION 'Transaction not yet eligible for auto-processing (24 hours not passed)';
  END IF;

  -- Check if confirmation fee has been verified (required for withdrawals)
  IF v_transaction.confirmation_fee_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Confirmation fee must be verified before auto-approving withdrawal. 10%% BTC payment verification required.';
  END IF;

  -- Get user's current balance
  SELECT balance_usdt INTO v_current_balance
  FROM profiles
  WHERE id = v_transaction.user_id
  FOR UPDATE;

  -- Check if user has sufficient balance (should already be deducted, but safety check)
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update transaction status to approved
  UPDATE transactions
  SET status = 'approved',
      processed_at = NOW(),
      admin_notes = COALESCE(admin_notes || ' | ', '') || 'Auto-approved after 24 hours with verified confirmation fee'
  WHERE id = p_transaction_id;

  -- Log the auto-approval action
  INSERT INTO admin_activity_logs (admin_id, admin_email, action, target_type, target_id, details)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'system@auto-process',
    'auto_approve_withdrawal',
    'transaction',
    p_transaction_id::TEXT,
    jsonb_build_object(
      'amount', v_transaction.amount,
      'user_id', v_transaction.user_id,
      'created_at', v_transaction.created_at,
      'auto_processed_at', NOW(),
      'confirmation_fee_verified', true,
      'confirmation_fee_tx_hash', v_transaction.confirmation_fee_tx_hash
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_transaction.amount,
    'confirmation_fee_verified', true
  );
END;
$$;

COMMENT ON FUNCTION public.auto_approve_withdrawal IS 'Automatically approves a withdrawal after 24 hours if the 10% BTC confirmation fee has been verified. Used by the auto-process-withdrawals edge function.';
