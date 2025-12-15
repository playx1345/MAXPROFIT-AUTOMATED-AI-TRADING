-- Migration: Add $1000 profit to user jacu
-- This migration adds a profit transaction and updates the balance for user jacu
-- This migration is idempotent - it will only add the profit once using a unique identifier

DO $$
DECLARE
  v_user_id UUID;
  v_profit_amount NUMERIC(20, 2) := 1000.00;
  v_user_email TEXT := 'jacu@example.com';
  v_current_balance NUMERIC(20, 2);
  v_new_balance NUMERIC(20, 2);
  v_migration_id TEXT := 'migration_20251215230000_profit_jacu';
  v_existing_transaction_count INTEGER;
BEGIN
  -- Check for idempotency - has this migration already been applied?
  SELECT COUNT(*) INTO v_existing_transaction_count
  FROM public.transactions
  WHERE admin_notes LIKE '%' || v_migration_id || '%'
    AND type = 'profit'
    AND amount = v_profit_amount;

  IF v_existing_transaction_count > 0 THEN
    RAISE NOTICE 'Migration already applied (found % existing transaction(s) with migration ID: %)', v_existing_transaction_count, v_migration_id;
    RETURN;
  END IF;

  -- Check if user exists in profiles by email
  SELECT id, balance_usdt INTO v_user_id, v_current_balance
  FROM public.profiles
  WHERE email = v_user_email;

  -- User must exist in profiles (which requires auth.users entry due to foreign key)
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist. Please create the user first using the create-admin-user script or through the auth system.', v_user_email;
  END IF;

  -- User profile exists, update balance
  v_new_balance := COALESCE(v_current_balance, 0) + v_profit_amount;
  
  UPDATE public.profiles
  SET balance_usdt = v_new_balance
  WHERE id = v_user_id;
  
  RAISE NOTICE 'Updated user jacu balance from % to %', COALESCE(v_current_balance, 0), v_new_balance;

  -- Create a profit transaction record with migration identifier
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    currency,
    status,
    admin_notes,
    processed_at
  ) VALUES (
    v_user_id,
    'profit',
    v_profit_amount,
    'usdt',
    'completed',
    'Manual profit addition - $' || v_profit_amount || ' profit added to jacu [' || v_migration_id || ']',
    NOW()
  );

  RAISE NOTICE 'Created profit transaction of $% for user jacu (ID: %)', v_profit_amount, v_user_id;
  RAISE NOTICE 'Final balance for jacu: $%', v_new_balance;
  RAISE NOTICE 'Migration % completed successfully', v_migration_id;
END $$;
