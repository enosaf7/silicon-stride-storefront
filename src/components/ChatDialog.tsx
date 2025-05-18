import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_ID = 'admin'; // replace with your actual admin user id

const ChatDialog = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chat messages between user and admin
  const fetchMessages = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${ADMIN_ID}),and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setIsLoading(false);
    if (!error && data) {
      setMessages(data);
      // Mark all received as read
      const unread = data.filter(
        (msg) => msg.receiver_id === user.id && !msg.is_read
      );
      if (unread.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unread.map((msg) => msg.id));
      }
    }
  };

  useEffect(() => {
    if (!open || !user) return;
    fetchMessages();
    // Subscribe to real-time updates
    const channel = supabase
      .channel('chat-dialog')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id},sender_id=eq.${ADMIN_ID}`
      }, fetchMessages)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id},receiver_id=eq.${ADMIN_ID}`
      }, fetchMessages)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [open, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setIsSubmitting(true);
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: ADMIN_ID,
      content: newMessage.trim(),
      is_read: false,
    });
    setNewMessage('');
    setIsSubmitting(false);
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Chat with Admin</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto mt-6 mb-4 flex flex-col" style={{ minHeight: 300 }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-4">No messages yet. Say hello!</div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-2 flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-3 py-2 ${msg.sender_id === user.id ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-900'}`}>
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-xs text-right text-gray-600 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            disabled={isSubmitting}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSend(e);
              }
            }}
          />
          <Button type="submit" disabled={isSubmitting || !newMessage.trim()}>
            Send
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ChatDialog;
