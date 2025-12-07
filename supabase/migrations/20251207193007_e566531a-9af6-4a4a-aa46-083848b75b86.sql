-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a more restrictive UPDATE policy using a trigger
-- Users can only update: full_name, phone, wallet_btc, wallet_usdt, kyc_submitted_at
-- They CANNOT update: balance_usdt, kyc_status, email, id, created_at, is_suspended

-- Create a function to validate profile updates
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_profile_update_trigger ON public.profiles;
CREATE TRIGGER validate_profile_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();

-- Recreate the user UPDATE policy (now the trigger handles column restrictions)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);