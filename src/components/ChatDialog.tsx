import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader, Reply, RefreshCw } from 'lucide-react';
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

const logAndToastError = (err: any, userMsg: string) => {
  console.error(userMsg, err);
  toast.error(userMsg);
};

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);

  // Fetch admin ID
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .limit(1);

        if (error) {
          logAndToastError(error, 'Error fetching admin');
          return;
        }
        if (data && data.length > 0) {
          setAdminId(data[0].user_id);
        } else {
          logAndToastError('No admin user found', 'No admin user found');
        }
      } catch (err) {
        logAndToastError(err, 'Failed to fetch admin ID');
      }
    };

    if (user) fetchAdminId();
  }, [user]);

  // Fetch messages and handle subscription
  const fetchMessages = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data as Message[]);
    } catch (err) {
      logAndToastError(err, 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Append new messages rather than re-fetch all
  const handleNewMessage = useCallback((payload: any, userId: string) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some((m) => m.id === payload.new.id)) return prev;
      // Only add if relevant
      if (payload.new.sender_id === userId || payload.new.receiver_id === userId) {
        return [...prev, payload.new as Message];
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!user || !open) return;
    fetchMessages(user.id);

    // Listen for new/updated messages
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => handleNewMessage(payload, user.id)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => handleNewMessage(payload, user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, open, fetchMessages, handleNewMessage]);

  // Mark as read
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
        logAndToastError(err, 'Failed to mark as read');
      }
    };
    markAsRead();
  }, [messages, user, open]);

  // Auto-scroll: only scroll if at bottom
  useEffect(() => {
    if (!open || !messagesEndRef.current || !chatScrollRef.current) return;
    const container = chatScrollRef.current;
    if (isAutoScrollRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // Reset autoscroll flag after scroll
    isAutoScrollRef.current = true;
  }, [messages, open]);

  // Track if user is at the bottom
  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const el = chatScrollRef.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    isAutoScrollRef.current = atBottom;
  };

  // Debounced sendMessage
  const sendMessage = useCallback(
    debounce(async () => {
      if (!user || !adminId || !newMessage.trim()) return;
      setIsSubmitting(true);
      setSendError(null);
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
        toast.success('Message sent');
      } catch (error) {
        setSendError('Failed to send message');
        logAndToastError(error, 'Failed to send message');
      } finally {
        setIsSubmitting(false);
      }
    }, 400),
    [user, adminId, newMessage, replyingTo]
  );

  // "Typing..." indicator for current user
  useEffect(() => {
    if (newMessage.length > 0) setIsTyping(true);
    else setIsTyping(false);
    const timeout = setTimeout(() => setIsTyping(false), 1800);
    return () => clearTimeout(timeout);
  }, [newMessage]);

  const handleSwipe = (message: Message) => {
    if (message.sender_id !== user?.id) {
      setReplyingTo(message);
    }
  };

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  }, []);

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Chat with Support</SheetTitle>
        </SheetHeader>

        <div
          className="flex-grow overflow-y-auto mt-6 mb-4 flex flex-col"
          ref={chatScrollRef}
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  currentUserId={user.id}
                  onSwipe={() => handleSwipe(message)}
                  formatDate={formatDate}
                  messages={messages}
                  adminId={adminId}
                  userId={user.id}
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="text-xs text-gray-400 px-4 mb-1" aria-live="polite">
            You are typing...
          </div>
        )}

        <div className="mt-auto border-t pt-4">
          {/* Reply preview */}
          {replyingTo && (
            <div className="mb-2 p-2 bg-gray-100 rounded-md text-sm relative flex items-center">
              <div>
                <p className="font-medium">
                  Replying to {replyingTo.sender_id === user.id ? "yourself" : "support"}:
                </p>
                <p className="truncate text-gray-600 max-w-xs">
                  {replyingTo.content.length > 60
                    ? replyingTo.content.slice(0, 60) + '...'
                    : replyingTo.content}
                </p>
              </div>
              <Button
                className="ml-auto"
                variant="ghost"
                size="icon"
                onClick={() => setReplyingTo(null)}
                aria-label="Cancel reply"
              >
                ×
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
              aria-label="Chat message input"
              disabled={isSubmitting}
            />
            <Button
              className="flex-grow rounded-l-none bg-brand-orange hover:bg-brand-orange/90"
              onClick={sendMessage}
              disabled={isSubmitting || !newMessage.trim() || !adminId}
              aria-label="Send message"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {/* Error and retry */}
          {sendError && (
            <div className="flex items-center mt-2 text-red-500 text-xs">
              {sendError}
              <Button
                size="sm"
                className="ml-2"
                variant="outline"
                onClick={sendMessage}
                aria-label="Retry sending message"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            </div>
          )}
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
  adminId: string | null;
  userId: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  onSwipe,
  formatDate,
  messages,
  adminId,
  userId
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

    if (diff > 0 && diff <= 100 && !isSentByMe) {
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateX > 50) {
      onSwipe();
    }
    setTranslateX(0);
  };

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
    <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
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
        aria-label={isSentByMe ? "Your message" : "Support message"}
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
                : `Reply to ${replyTo.sender_id === adminId ? "support" : "you"}:`}
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
              aria-label="Reply to this message"
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
