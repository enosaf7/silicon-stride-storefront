
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send,
  MessageCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatSectionProps {
  userId: string;
  currentAdminId: string;
  isOpen: boolean;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  userId,
  currentAdminId,
  isOpen
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch messages between admin and user
  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['conversation-messages', userId, currentAdminId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        user1: currentAdminId,
        user2: userId
      });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!userId && isOpen
  });

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!userId || !isOpen) return;

    const channel = supabase
      .channel('conversation-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=in.(${currentAdminId},${userId}),receiver_id=in.(${currentAdminId},${userId})`
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentAdminId, isOpen, refetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentAdminId,
          receiver_id: userId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent successfully');
      refetchMessages();
    } catch (error: any) {
      toast.error('Failed to send message: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Chat with User</h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 border rounded-lg p-4 mb-4 min-h-[300px]">
        <div className="space-y-3">
          {messages?.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages?.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentAdminId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === currentAdminId
                      ? 'bg-brand-orange text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 opacity-70" />
                    <span className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSending}
          className="flex-1"
        />
        <Button 
          onClick={sendMessage} 
          disabled={!newMessage.trim() || isSending}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatSection;
