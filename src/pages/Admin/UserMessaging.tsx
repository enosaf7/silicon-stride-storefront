
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader, Send, Search, Reply, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageAttachment, AttachmentPreview } from '@/components/MessageAttachment';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

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

const UserMessaging: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; type: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Fetch users
  const { data: usersData = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get profiles with user information
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profileError) {
        toast.error('Failed to load user profiles');
        throw profileError;
      }

      // Get user emails from auth using service role (in a real app)
      // Here we'll simulate it with existing profiles
      const users = profiles.map(profile => ({
        ...profile,
        email: `user_${profile.id.substring(0, 8)}@example.com`, // Simulated email
        created_at: new Date().toISOString()
      }));
      
      return users as User[];
    },
    enabled: !!user && isAdmin,
  });

  // Safely handle users data
  const users = usersData || [];

  // Fetch messages for selected user
  const { data: messagesData = [], refetch: refetchMessages } = useQuery({
    queryKey: ['user-messages', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser || !user) return [] as Message[];

      const { data, error } = await supabase
        .rpc('get_conversation_messages', {
          user1: user.id, 
          user2: selectedUser.id
        });

      if (error) {
        toast.error('Failed to load messages');
        throw error;
      }
      
      return data as Message[];
    },
    enabled: !!selectedUser && !!user,
    refetchInterval: 5000, // Refresh every 5s to get new messages
  });

  // Safely handle messages data
  const messages = messagesData || [];

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  const sendMessage = async () => {
    if (!selectedUser || (!messageContent.trim() && !attachment) || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedUser.id,
          content: messageContent,
          is_read: false,
          attachment_url: attachment?.url,
          attachment_type: attachment?.type,
          reply_to: replyingTo?.id
        });
        
      if (error) throw error;
      
      // Clear input and refetch messages
      setMessageContent('');
      setAttachment(null);
      setReplyingTo(null);
      refetchMessages();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/login');
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">User Messaging</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Users List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-4 h-[calc(100vh-300px)] overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader className="animate-spin h-6 w-6 text-brand-orange" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <li 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>
          
          {/* Messages */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                {/* Selected User Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <div>
                    <h2 className="font-semibold">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                
                {/* Messages Content */}
                <div className="flex-grow p-4 overflow-y-auto h-[calc(100vh-400px)] flex flex-col-reverse">
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`relative p-3 rounded-lg max-w-[80%] ${
                              message.sender_id === user?.id 
                                ? 'bg-brand-orange text-white' 
                                : 'bg-gray-100'
                            }`}
                          >
                            {/* Reply preview */}
                            {message.reply_to && (
                              <div className={`text-xs mb-2 p-2 rounded ${
                                message.sender_id === user?.id 
                                  ? 'bg-white/10 text-white/90' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                <p className="font-semibold">
                                  {message.sender_id === user?.id ? "You replied to:" : "Reply to:"}
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
                                message.sender_id === user?.id 
                                  ? 'text-white/70' 
                                  : 'text-gray-500'
                              }`}>
                                {formatDate(message.created_at)}
                              </p>
                              
                              {message.sender_id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-5 w-5 ml-2 ${
                                    message.sender_id === user?.id 
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
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages yet. Start a conversation!
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
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
                      placeholder="Type your message..."
                      className="min-h-[60px] flex-grow rounded-r-none"
                      value={messageContent}
                      onChange={e => setMessageContent(e.target.value)}
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
                        disabled={isSubmitting || (!messageContent.trim() && !attachment)}
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
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a user to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserMessaging;
