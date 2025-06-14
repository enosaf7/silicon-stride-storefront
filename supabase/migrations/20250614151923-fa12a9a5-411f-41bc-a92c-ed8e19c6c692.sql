
-- Create a table to store user conversations/chat sessions
CREATE TABLE IF NOT EXISTS public.user_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, admin_id)
);

-- Enable RLS on user_conversations
ALTER TABLE public.user_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_conversations
CREATE POLICY "Admins can view all conversations" ON public.user_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create conversations" ON public.user_conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only enable RLS on messages if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'messages' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create additional policies for messages (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can send messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can send messages" ON public.messages
      FOR INSERT WITH CHECK (sender_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can update their own messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own messages" ON public.messages
      FOR UPDATE USING (sender_id = auth.uid())';
  END IF;
END $$;
