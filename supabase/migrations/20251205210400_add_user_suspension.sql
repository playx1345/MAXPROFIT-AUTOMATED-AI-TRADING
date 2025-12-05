-- Add is_suspended column to profiles table for tracking account suspension status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on suspended users
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.is_suspended IS 'Indicates whether the user account is suspended by an admin';
