import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ChatDialog from '@/components/ChatDialog';

const ADMIN_ID = 'admin';

const ChatButton = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch unread count
    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('sender_id', ADMIN_ID)
        .eq('is_read', false);

      if (!error && data) setUnreadCount(data.length);
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id},sender_id=eq.${ADMIN_ID}`,
        },
        (payload) => {
          if (payload.new && !payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id},sender_id=eq.${ADMIN_ID}`,
        },
        (payload) => {
          if (
            payload.old &&
            !payload.old.is_read &&
            payload.new &&
            payload.new.is_read
          ) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [open, unreadCount]);

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label="Chat with Admin"
      >
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ChatButton;
