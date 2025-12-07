-- Add is_suspended column to profiles table
ALTER TABLE public.profiles ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;