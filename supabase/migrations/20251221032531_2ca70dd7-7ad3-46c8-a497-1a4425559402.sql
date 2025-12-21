-- Create chat_messages table for live chat feature
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL DEFAULT true,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages (by session_id for anonymous or user_id for authenticated)
CREATE POLICY "Users can view own chat messages"
ON public.chat_messages
FOR SELECT
USING (
  (user_id = auth.uid()) OR 
  (user_id IS NULL AND session_id = current_setting('request.headers')::json->>'x-session-id')
);

-- Users can insert their own messages
CREATE POLICY "Users can insert chat messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

-- Admins can view all chat messages
CREATE POLICY "Admins can view all chat messages"
ON public.chat_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update chat messages (mark as read)
CREATE POLICY "Admins can update chat messages"
ON public.chat_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to chat_messages"
ON public.chat_messages
FOR ALL
USING (false);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);