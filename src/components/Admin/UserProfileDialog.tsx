
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Send,
  MessageCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  order_count: number;
  role: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface UserProfileDialogProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  currentAdminId: string;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  user,
  isOpen,
  onClose,
  onRefresh,
  currentAdminId
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  // Fetch messages between admin and user
  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['conversation-messages', user?.id, currentAdminId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        user1: currentAdminId,
        user2: user.id
      });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id && isOpen
  });

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!user?.id || !isOpen) return;

    const channel = supabase
      .channel('conversation-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=in.(${currentAdminId},${user.id}),receiver_id=in.(${currentAdminId},${user.id})`
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentAdminId, isOpen, refetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentAdminId,
          receiver_id: user.id,
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

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${user.email || user.id}`}
                alt="Profile Picture"
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-xl font-semibold">
                {user.first_name || ''} {user.last_name || ''}
              </span>
              <Badge className="ml-2" variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* User Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.email || 'No email provided'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.phone || 'No phone provided'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.address || 'No address provided'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.order_count} total orders</span>
              </div>
            </div>
          </div>

          {/* Chat Section */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
