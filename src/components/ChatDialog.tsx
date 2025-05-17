
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader, Reply, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  reply_to?: string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch messages when chat opens
  useEffect(() => {
    if (!user || !open) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          setMessages(data as Message[]);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}` // Listen to messages from this user
        },
        () => {
          // Simply refetch messages on any change
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}` // Listen to messages to this user
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, open]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (!user || !open) return;

    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => msg.receiver_id === user.id && !msg.is_read
      );
      
      if (unreadMessages.length === 0) return;
      
      try {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
          
        if (error) throw error;
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    };
    
    markAsRead();
  }, [messages, user, open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!user || !adminId || !newMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: adminId,
          content: newMessage.trim(),
          is_read: false,
          reply_to: replyingTo?.id
        });
        
      if (error) throw error;
      
      setNewMessage('');
      setReplyingTo(null);
      toast.success("Message sent");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwipe = (message: Message) => {
    if (message.sender_id !== user?.id) {
      setReplyingTo(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Chat with Support</SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto mt-6 mb-4 flex flex-col">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map(message => (
                <ChatMessage 
                  key={message.id}
                  message={message} 
                  currentUserId={user.id}
                  onSwipe={() => handleSwipe(message)}
                  formatDate={formatDate}
                  messages={messages}
                />
              ))}
              <div ref={messagesEndRef} />
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
                className="flex-grow rounded-l-none bg-brand-orange hover:bg-brand-orange/90"
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
          )}
          
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
              className="flex-grow rounded-l-none bg-brand-orange hover:bg-brand-orange/90"
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

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
  onSwipe: () => void;
  formatDate: (date: string) => string;
  messages: Message[];
}

// ChatMessage component with swipe to reply functionality
const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  currentUserId, 
  onSwipe,
  formatDate,
  messages
}) => {
  const [touchStart, setTouchStart] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const messageRef = useRef<HTMLDivElement>(null);
  const isSentByMe = message.sender_id === currentUserId;

  // Find the original message if this is a reply
  const replyTo = message.reply_to 
    ? messages.find(m => m.id === message.reply_to)
    : null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Only allow right swipe (positive diff) and limit the swipe distance
    if (diff > 0 && diff <= 100 && !isSentByMe) {
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateX > 50) {
      // If swiped enough, trigger reply
      onSwipe();
    }
    // Reset position
    setTranslateX(0);
  };

  // For desktop - mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - touchStart;
      if (diff > 0 && diff <= 100 && !isSentByMe) {
        setTranslateX(diff);
      }
    };
    
    const handleMouseUp = () => {
      if (translateX > 50) {
        onSwipe();
      }
      setTranslateX(0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        ref={messageRef}
        className={`relative p-3 rounded-lg max-w-[85%] ${
          isSentByMe 
            ? 'bg-brand-orange text-white' 
            : 'bg-gray-100'
        }`}
        style={{ 
          transform: `translateX(${translateX}px)`,
          transition: translateX === 0 ? 'transform 0.2s ease' : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={!isSentByMe ? handleMouseDown : undefined}
      >
        {/* Reply preview */}
        {replyTo && (
          <div className={`text-xs mb-2 p-2 rounded ${
            isSentByMe 
              ? 'bg-white/10 text-white/90' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            <p className="font-semibold">
              {replyTo.sender_id === currentUserId 
                ? "Reply to your message:" 
                : "Reply to:"}
            </p>
            <p className="truncate">{replyTo.content}</p>
          </div>
        )}

        <p>{message.content}</p>
        
        <div className="flex justify-between items-center mt-1">
          <p className={`text-xs ${
            isSentByMe 
              ? 'text-white/70' 
              : 'text-gray-500'
          }`}>
            {formatDate(message.created_at)}
          </p>
          
          {!isSentByMe && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-5 w-5 ml-2 ${
                isSentByMe 
                  ? 'text-white/80 hover:text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={onSwipe}
            >
              <Reply className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Visual indicator for swipe */}
        {translateX > 0 && !isSentByMe && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6">
            <Reply className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDialog;
