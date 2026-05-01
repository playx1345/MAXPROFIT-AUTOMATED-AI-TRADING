-- Add fee_exempt column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN fee_exempt boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.fee_exempt IS 'When true, user is exempt from blockchain confirmation fee popups';