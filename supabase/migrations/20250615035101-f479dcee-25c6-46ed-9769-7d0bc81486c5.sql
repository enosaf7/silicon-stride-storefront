
-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_user_messages(uuid);
DROP FUNCTION IF EXISTS public.get_admin_user_conversation(uuid);
DROP FUNCTION IF EXISTS public.get_admin_conversations();

-- Add a column to identify admin messages and create a shared admin system
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_admin_message boolean DEFAULT false;

-- Update the column to mark existing admin messages
UPDATE public.messages 
SET is_admin_message = true 
WHERE sender_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- Create or replace function to get user messages (treating all admin messages as unified)
CREATE OR REPLACE FUNCTION public.get_user_messages(user_id uuid)
RETURNS TABLE(id uuid, sender_id uuid, receiver_id uuid, content text, created_at timestamp with time zone, is_read boolean, is_admin_message boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at, m.is_read, m.is_admin_message
  FROM messages m
  WHERE (m.sender_id = user_id OR m.receiver_id = user_id)
     OR (m.is_admin_message = true AND m.receiver_id = user_id)
     OR (m.sender_id = user_id AND m.receiver_id IN (
       SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin'
     ))
  ORDER BY m.created_at ASC;
END;
$function$;

-- Create or replace function to get conversation messages between user and admins
CREATE OR REPLACE FUNCTION public.get_admin_user_conversation(target_user_id uuid)
RETURNS TABLE(id uuid, sender_id uuid, receiver_id uuid, content text, created_at timestamp with time zone, is_read boolean, is_admin_message boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at, m.is_read, m.is_admin_message
  FROM messages m
  WHERE (
    -- Messages from user to any admin
    (m.sender_id = target_user_id AND m.receiver_id IN (
      SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin'
    ))
    OR
    -- Messages from any admin to user
    (m.receiver_id = target_user_id AND m.sender_id IN (
      SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin'
    ))
  )
  ORDER BY m.created_at ASC;
END;
$function$;

-- Update get_admin_conversations to show unified conversations
CREATE OR REPLACE FUNCTION public.get_admin_conversations()
RETURNS TABLE(user_id uuid, first_name text, last_name text, unread_count bigint, last_message_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.first_name,
    p.last_name,
    COUNT(m.id) FILTER (WHERE m.is_read = false AND m.sender_id = p.id) as unread_count,
    MAX(m.created_at) as last_message_at
  FROM 
    profiles p
  JOIN 
    messages m ON (
      (m.sender_id = p.id AND m.receiver_id IN (
        SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin'
      )) OR 
      (m.receiver_id = p.id AND m.sender_id IN (
        SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin'
      ))
    )
  WHERE 
    p.id NOT IN (SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin')
  GROUP BY 
    p.id, p.first_name, p.last_name
  HAVING 
    COUNT(m.id) > 0
  ORDER BY 
    last_message_at DESC;
END;
$function$;

-- Function to mark messages as read for admins (when any admin reads, mark as read)
CREATE OR REPLACE FUNCTION public.mark_user_messages_as_read(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE messages
  SET is_read = true
  WHERE sender_id = target_user_id 
    AND receiver_id IN (
      SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin'
    )
    AND is_read = false;
END;
$function$;

-- Trigger to automatically mark admin messages
CREATE OR REPLACE FUNCTION public.mark_admin_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if sender is admin and mark the message
  IF EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = NEW.sender_id AND ur.role = 'admin'
  ) THEN
    NEW.is_admin_message = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for marking admin messages
DROP TRIGGER IF EXISTS mark_admin_messages_trigger ON public.messages;
CREATE TRIGGER mark_admin_messages_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_admin_messages();
