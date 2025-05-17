
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
import { MailIcon, Send, Loader, Reply, X } from 'lucide-react';
import { MessageAttachment, AttachmentPreview } from '@/components/MessageAttachment';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  receiver_name?: string;
  attachment_url?: string;
  attachment_type?: string;
  reply_to?: string;
  reply_content?: string;
}

const UserMessages = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{ url: string; type: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Get admin user ID for messaging
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
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
        } else {
          console.error('No admin user found');
        }
      } catch (err) {
        console.error('Failed to fetch admin ID:', err);
      }
    };
    
    if (user) {
      fetchAdminId();
    }
  }, [user]);

  // Fetch messages using RPC to avoid type issues
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['user-messages', user?.id],
    queryFn: async () => {
      if (!user) return [] as Message[];

      try {
        const { data, error } = await supabase
          .rpc('get_user_messages', { user_id: user.id });

        if (error) {
          console.error('Failed to load messages:', error);
          toast.error("Failed to load messages");
          return [] as Message[];
        }
        
        // For each message, check if it's a reply and fetch the original message content
        const enhancedMessages = await Promise.all((data || []).map(async (msg: any) => {
          if (msg.reply_to) {
            const { data: replyData } = await supabase
              .from('messages')
              .select('content')
              .eq('id', msg.reply_to)
              .single();
              
            return {
              ...msg,
              reply_content: replyData?.content || 'Original message not found'
            };
          }
          return msg;
        }));
        
        return enhancedMessages as Message[];
      } catch (err) {
        console.error('Error in message fetching:', err);
        toast.error("Failed to load messages");
        return [] as Message[];
      }
    },
    enabled: !!user,
    refetchInterval: open ? 5000 : 30000, // Refresh every 5s when open, otherwise every 30s
  });

  // Safely access messages data
  const messages = messagesData || [];

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
        const promise = supabase
          .rpc('mark_messages_as_read', {
            user_id: user.id,
            message_ids: unreadMessages.map(msg => msg.id)
          })
          
        // Handle the promise correctly
        promise
          .then(({ error }) => {
            if (error) {
              console.error('Error marking messages as read:', error);
              return;
            }
            setUnreadCount(0);
            refetchMessages();
          })
          .catch(error => { 
            console.error('Failed to mark messages as read:', error);
          });
      }
    }
  }, [open, user, messages, refetchMessages]);

  const sendMessage = async () => {
    if (!user || !adminId || (!newMessage.trim() && !attachment)) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: adminId,
          content: newMessage,
          is_read: false,
          attachment_url: attachment?.url,
          attachment_type: attachment?.type,
          reply_to: replyingTo?.id
        });
        
      if (error) throw error;
      
      toast.success("Message sent successfully");
      setNewMessage('');
      setAttachment(null);
      setReplyingTo(null);
      refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachment = (url: string, type: string) => {
    setAttachment({ url, type });
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
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
                    className={`relative p-3 rounded-lg max-w-[85%] ${
                      message.sender_id === user.id 
                        ? 'bg-brand-orange text-white' 
                        : 'bg-gray-100'
                    }`}
                  >
                    {/* Reply preview if this message is a reply */}
                    {message.reply_to && (
                      <div className={`text-xs mb-2 p-2 rounded ${
                        message.sender_id === user.id 
                          ? 'bg-white/10 text-white/90' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        <p className="font-semibold">
                          {message.sender_id === user.id ? "You replied to:" : "Reply to:"}
                        </p>
                        <p className="truncate">
                          {message.reply_content || "..."}
                        </p>
                      </div>
                    )}

                    <p>{message.content}</p>
                    
                    {/* Attachment Preview */}
                    {message.attachment_url && (
                      <div className="mt-2">
                        <AttachmentPreview 
                          url={message.attachment_url} 
                          type={message.attachment_type || 'file'} 
                          className="max-w-full"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs ${
                        message.sender_id === user.id 
                          ? 'text-white/70' 
                          : 'text-gray-500'
                      }`}>
                        {formatDate(message.created_at)}
                      </p>
                      
                      {message.sender_id !== user.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 ml-2 ${
                            message.sender_id === user.id 
                              ? 'text-white/80 hover:text-white' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => handleReply(message)}
                        >
                          <Reply className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              No messages yet. Need assistance? Send us a message and our customer support team will get back to you soon!
            </div>
          )}
        </div>
        
        <div className="mt-auto border-t pt-4">
          {/* Reply preview */}
          {replyingTo && (
            <div className="mb-2 p-2 bg-gray-100 rounded-md text-sm relative">
              <p className="font-medium">Replying to:</p>
              <p className="truncate text-gray-600">{replyingTo.content}</p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={cancelReply}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* Attachment preview */}
          {attachment && (
            <div className="mb-2">
              <AttachmentPreview 
                url={attachment.url} 
                type={attachment.type} 
                onRemove={() => setAttachment(null)} 
              />
            </div>
          )}
          
          <div className="flex">
            <Textarea
              placeholder="Type your message to customer support..."
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
            <div className="flex flex-col">
              <MessageAttachment onAttach={handleAttachment} />
              <Button 
                className="flex-grow rounded-l-none bg-brand-orange hover:bg-brand-orange/90"
                onClick={sendMessage}
                disabled={isSubmitting || (!newMessage.trim() && !attachment) || !adminId}
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserMessages;
