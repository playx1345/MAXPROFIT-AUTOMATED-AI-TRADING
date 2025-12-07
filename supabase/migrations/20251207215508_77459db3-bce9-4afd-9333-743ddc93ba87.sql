-- Add upgrade_fee_paid column to profiles table
ALTER TABLE public.profiles ADD COLUMN upgrade_fee_paid boolean NOT NULL DEFAULT false;

-- Update the validate_profile_update trigger to protect upgrade_fee_paid field
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from modifying protected fields (only applies to non-admins)
  IF NOT has_role(auth.uid(), 'admin') THEN
    -- Check if user is trying to modify protected fields
    IF OLD.balance_usdt IS DISTINCT FROM NEW.balance_usdt THEN
      RAISE EXCEPTION 'Cannot modify balance_usdt';
    END IF;
    
    IF OLD.kyc_status IS DISTINCT FROM NEW.kyc_status THEN
      RAISE EXCEPTION 'Cannot modify kyc_status';
    END IF;
    
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      RAISE EXCEPTION 'Cannot modify email';
    END IF;
    
    IF OLD.id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'Cannot modify id';
    END IF;
    
    IF OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'Cannot modify created_at';
    END IF;
    
    IF OLD.is_suspended IS DISTINCT FROM NEW.is_suspended THEN
      RAISE EXCEPTION 'Cannot modify is_suspended';
    END IF;
    
    IF OLD.upgrade_fee_paid IS DISTINCT FROM NEW.upgrade_fee_paid THEN
      RAISE EXCEPTION 'Cannot modify upgrade_fee_paid';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;