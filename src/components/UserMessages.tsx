
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MailIcon, Send, Loader } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  receiver_name?: string;
}

const UserMessages = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  // Get admin user ID for messaging
  useEffect(() => {
    const fetchAdminId = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1);
        
      if (error) {
        console.error('Error fetching admin:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setAdminId(data[0].user_id);
      }
    };
    
    fetchAdminId();
  }, []);

  // Fetch messages using RPC to work around type issues
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['user-messages', user?.id],
    queryFn: async () => {
      if (!user) return [] as Message[];

      // Use a basic query without joins to avoid type issues
      const { data, error } = await supabase
        .rpc('get_user_messages', { user_id: user.id })
        .returns<Message[]>();

      if (error) {
        toast.error('Failed to load messages');
        throw error;
      }
      
      // Mark messages as read when opened
      if (open) {
        const unreadMessages = data.filter(
          msg => msg.receiver_id === user.id && !msg.is_read
        );
        
        if (unreadMessages.length > 0) {
          // Use a custom RPC function to mark messages as read
          await supabase
            .rpc('mark_messages_as_read', {
              user_id: user.id,
              message_ids: unreadMessages.map(msg => msg.id)
            });
        }
      }
      
      return data;
    },
    enabled: !!user,
    refetchInterval: open ? 5000 : 30000, // Refresh every 5s when open, otherwise every 30s
  });

  // Count unread messages
  useEffect(() => {
    if (messages && user) {
      const unread = messages.filter(
        msg => msg.receiver_id === user.id && !msg.is_read
      ).length;
      setUnreadCount(unread);
    }
  }, [messages, user]);

  // Mark messages as read when opening the sheet
  useEffect(() => {
    if (open && user && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.receiver_id === user.id && !msg.is_read
      );
      
      if (unreadMessages.length > 0) {
        // Use a custom RPC function to mark messages as read
        supabase
          .rpc('mark_messages_as_read', {
            user_id: user.id,
            message_ids: unreadMessages.map(msg => msg.id)
          })
          .then(() => {
            setUnreadCount(0);
            refetchMessages();
          });
      }
    }
  }, [open, user, messages]);

  const sendMessage = async () => {
    if (!user || !adminId || !newMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Use direct REST API call to avoid type issues
      const { error } = await supabase.rest.post(
        '/rest/v1/messages',
        {
          sender_id: user.id,
          receiver_id: adminId,
          content: newMessage,
          is_read: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }
      );
        
      if (error) throw error;
      
      setNewMessage('');
      refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Messages"
        >
          <MailIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Messages</SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto mt-6 mb-4 flex flex-col-reverse">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.sender_id === user.id 
                        ? 'bg-brand-orange text-white' 
                        : 'bg-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user.id 
                        ? 'text-white/70' 
                        : 'text-gray-500'
                    }`}>
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              No messages yet
            </div>
          )}
        </div>
        
        <div className="mt-auto border-t pt-4">
          <div className="flex">
            <Textarea
              placeholder="Type your message..."
              className="min-h-[60px] flex-grow rounded-r-none"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              className="rounded-l-none bg-brand-orange hover:bg-brand-orange/90"
              onClick={sendMessage}
              disabled={isSubmitting || !newMessage.trim() || !adminId}
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserMessages;
