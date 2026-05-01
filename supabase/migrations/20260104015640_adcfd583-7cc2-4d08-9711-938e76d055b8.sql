-- Create platform_settings table for storing admin configurable settings
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can view all settings"
  ON public.platform_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings"
  ON public.platform_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
  ON public.platform_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
  ON public.platform_settings FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to platform_settings"
  ON public.platform_settings FOR ALL
  USING (false);

-- Insert default settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('confirmation_fee_percentage', '10', 'Confirmation fee percentage for withdrawals'),
  ('confirmation_fee_wallet_btc', 'bc1qhnfj2sa5wjs52de36gnlu4848g8870amu5epxh', 'BTC wallet address for confirmation fees'),
  ('auto_process_hours', '24', 'Hours before auto-processing withdrawals'),
  ('min_withdrawal_amount', '50', 'Minimum withdrawal amount in USD'),
  ('platform_wallet_usdt', 'TDrBuPR9s7332so5FWT14ovWFXvjJH75Ur', 'Platform USDT wallet for deposits'),
  ('platform_wallet_btc', 'bc1qyf87rz5ulfca0409zluqdkvlhyfd5qu008377h', 'Platform BTC wallet for deposits'),
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('email_notifications_enabled', 'true', 'Enable email notifications to users');