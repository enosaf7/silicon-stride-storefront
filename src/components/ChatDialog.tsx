
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendMessage = async () => {
    if (!user || !message.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Find admin user (we'll use the first user with admin role)
      const { data: adminData, error: adminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminError || !adminData) {
        toast.error('Unable to find admin. Please try again later.');
        return;
      }

      // Insert the message using a direct query to avoid TypeScript issues
      const { error } = await supabase
        .rpc('exec_sql', {
          query: `
            INSERT INTO public.messages (sender_id, receiver_id, content, is_read)
            VALUES ($1, $2, $3, $4)
          `,
          params: [user.id, adminData.user_id, message.trim(), false]
        })
        .catch(async () => {
          // Fallback: use direct SQL insert
          const { error: insertError } = await supabase
            .from('messages' as any)
            .insert({
              sender_id: user.id,
              receiver_id: adminData.user_id,
              content: message.trim(),
              is_read: false
            });
          return { error: insertError };
        });
        
      if (error) throw error;
      
      setMessage('');
      toast.success('Message sent successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat with Support</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Your Message:
            </label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={sendMessage}
              disabled={isSubmitting || !message.trim()}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
