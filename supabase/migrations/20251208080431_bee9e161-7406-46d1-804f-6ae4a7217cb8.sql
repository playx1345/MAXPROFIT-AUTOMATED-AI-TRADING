-- 1. Add restrictive policy to deny anonymous SELECT on contact_messages
CREATE POLICY "Deny anonymous SELECT on contact_messages"
ON public.contact_messages
FOR SELECT
USING (auth.role() != 'anon');

-- 2. Add restrictive policy to deny anonymous access to investment_plans
CREATE POLICY "Deny anonymous access to investment_plans"
ON public.investment_plans
FOR ALL
USING (false);

-- 3. Create trigger function to prevent self-role modification
CREATE OR REPLACE FUNCTION public.prevent_self_role_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- For INSERT: prevent users from assigning roles to themselves (unless they're admin)
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id = auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Cannot assign roles to yourself';
    END IF;
  END IF;
  
  -- For UPDATE: prevent users from modifying their own roles (unless they're admin)
  IF TG_OP = 'UPDATE' THEN
    IF OLD.user_id = auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Cannot modify your own role';
    END IF;
  END IF;
  
  -- For DELETE: prevent users from removing their own roles (unless they're admin)
  IF TG_OP = 'DELETE' THEN
    IF OLD.user_id = auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Cannot remove your own role';
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger on user_roles table
CREATE TRIGGER prevent_self_role_modification_trigger
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_role_modification();