import React, { useEffect, useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Paperclip } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_ID = 'admin';

const ChatDialog = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chat history
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
      // Mark received as read
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
    // Real-time subscription
    const channel = supabase
      .channel('chat-dialog')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${ADMIN_ID},receiver_id=eq.${user.id}`
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
  }, [open, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Upload file to Supabase Storage and return public URL
  const uploadMedia = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file);
    if (error) throw error;
    // Get public URL
    const { data: urlData } = await supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !mediaFile) || !user) return;
    setIsSubmitting(true);

    let mediaUrl = null;
    if (mediaFile) {
      try {
        mediaUrl = await uploadMedia(mediaFile);
      } catch (err) {
        alert('Failed to upload media.');
        setIsSubmitting(false);
        return;
      }
    }

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: ADMIN_ID,
      content: newMessage.trim(),
      is_read: false,
      media_url: mediaUrl,
    });
    setNewMessage('');
    setMediaFile(null);
    setIsSubmitting(false);
  };

  const handleMediaChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
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
                    {msg.media_url && (
                      <div className="mb-1">
                        {msg.media_url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                          <img src={msg.media_url} alt="media" className="max-w-xs max-h-44 rounded mb-1" />
                        ) : msg.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video controls src={msg.media_url} className="max-w-xs max-h-44 rounded mb-1" />
                        ) : (
                          <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="underline">View file</a>
                        )}
                      </div>
                    )}
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-xs text-right text-gray-600 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            disabled={isSubmitting}
            style={{ flex: 1 }}
          />
          <label className="cursor-pointer">
            <Paperclip />
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
          </label>
          <Button type="submit" disabled={isSubmitting || (!newMessage.trim() && !mediaFile)}>
            Send
          </Button>
        </form>
        {mediaFile && (
          <div className="text-xs mt-1 text-gray-700 flex items-center gap-1">
            <span>Selected:</span>
            <span className="font-semibold">{mediaFile.name}</span>
            <button type="button" onClick={() => setMediaFile(null)} className="text-red-500 ml-2">Remove</button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ChatDialog;
