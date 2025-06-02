
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ChatDialog from '@/components/ChatDialog';

const ChatButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)}
        aria-label="Chat with Support"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ChatButton;
