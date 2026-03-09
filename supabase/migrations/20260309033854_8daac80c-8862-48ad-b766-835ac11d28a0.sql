
ALTER TABLE public.transactions
ADD COLUMN blockchain_confirmations integer NOT NULL DEFAULT 0,
ADD COLUMN required_confirmations integer NOT NULL DEFAULT 0;

-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
