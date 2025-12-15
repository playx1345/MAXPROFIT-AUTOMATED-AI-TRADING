-- Migration: Add $1000 profit to user jacu
-- This migration adds a profit transaction and updates the balance for user jacu

-- First, ensure the user exists in the profiles table
-- We'll use an upsert approach: if the user doesn't exist, create them; otherwise, update their balance

DO $$
DECLARE
  v_user_id UUID;
  v_profit_amount NUMERIC(20, 2) := 1000.00;
  v_user_email TEXT := 'jacu@example.com';
  v_current_balance NUMERIC(20, 2);
  v_new_balance NUMERIC(20, 2);
  v_auth_user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users first
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = v_user_email
  ) INTO v_auth_user_exists;

  -- Check if user exists in profiles by email
  SELECT id, balance_usdt INTO v_user_id, v_current_balance
  FROM public.profiles
  WHERE email = v_user_email;

  -- If user doesn't exist in profiles
  IF v_user_id IS NULL THEN
    -- If user exists in auth.users, get their ID
    IF v_auth_user_exists THEN
      SELECT id INTO v_user_id
      FROM auth.users
      WHERE email = v_user_email;
      
      -- Insert profile (trigger may have failed or not run yet)
      INSERT INTO public.profiles (id, email, full_name, balance_usdt)
      VALUES (v_user_id, v_user_email, 'Jacu', v_profit_amount)
      ON CONFLICT (id) DO UPDATE
      SET balance_usdt = public.profiles.balance_usdt + v_profit_amount;
      
      v_new_balance := v_profit_amount;
      RAISE NOTICE 'Created profile for existing auth user jacu with balance %', v_profit_amount;
    ELSE
      -- Create completely new user (only in profiles - auth user should be created separately)
      v_user_id := gen_random_uuid();
      
      INSERT INTO public.profiles (id, email, full_name, balance_usdt)
      VALUES (v_user_id, v_user_email, 'Jacu', v_profit_amount);
      
      v_new_balance := v_profit_amount;
      RAISE NOTICE 'Created new profile for jacu with initial balance %', v_profit_amount;
      RAISE WARNING 'User jacu created in profiles only - auth.users entry should be created separately for login access';
    END IF;
  ELSE
    -- User profile exists, update balance
    v_new_balance := COALESCE(v_current_balance, 0) + v_profit_amount;
    
    UPDATE public.profiles
    SET balance_usdt = v_new_balance
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Updated user jacu balance from % to %', COALESCE(v_current_balance, 0), v_new_balance;
  END IF;

  -- Create a profit transaction record
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
    'Manual profit addition - $1000 profit added to jacu',
    NOW()
  );

  RAISE NOTICE 'Created profit transaction of $% for user jacu (ID: %)', v_profit_amount, v_user_id;
  RAISE NOTICE 'Final balance for jacu: $%', v_new_balance;
END $$;
