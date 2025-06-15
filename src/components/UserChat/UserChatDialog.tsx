
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle,
  Send,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  is_admin_message: boolean;
}

interface UserChatDialogProps {
  userId: string;
}

const UserChatDialog: React.FC<UserChatDialogProps> = ({ userId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user messages using the updated function
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['user-messages', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_messages', {
        user_id: userId
      });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!userId && isOpen
  });

  // Count unread messages from admins
  const unreadCount = messages.filter(msg => 
    msg.is_admin_message && msg.receiver_id === userId && !msg.is_read
  ).length;

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!userId || !isOpen) return;

    const channel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isOpen, refetchMessages]);

  // Mark messages as read when dialog opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.is_admin_message && msg.receiver_id === userId && !msg.is_read)
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        supabase.rpc('mark_messages_as_read', {
          user_id: userId,
          message_ids: unreadMessageIds
        });
      }
    }
  }, [isOpen, messages, userId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || isSending) return;

    // Get admin users to send message to (we'll send to the first admin found)
    const { data: adminUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1);

    if (!adminUsers || adminUsers.length === 0) {
      toast.error('No admin available to receive messages');
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: adminUsers[0].user_id,
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <MessageCircle className="h-4 w-4 mr-2" />
          Messages
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with Support
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 border rounded-lg p-4 mb-4 min-h-[400px]">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start a conversation with our support team!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === userId
                          ? 'bg-brand-orange text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.is_admin_message && message.sender_id !== userId && (
                        <div className="text-xs font-semibold mb-1 opacity-70">
                          Support Team
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 opacity-70" />
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                        {message.sender_id === userId && (
                          <span className="text-xs opacity-70 ml-1">
                            {message.is_read ? '✓✓' : '✓'}
                          </span>
                        )}
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
              placeholder="Type your message to support..."
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
      </DialogContent>
    </Dialog>
  );
};

export default UserChatDialog;
