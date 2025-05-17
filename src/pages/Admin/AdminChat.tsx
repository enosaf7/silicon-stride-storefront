
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader, Send, Search, Reply, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  reply_to?: string | null;
}

const AdminChat: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, navigate, isLoading]);

  // Fetch users who have sent messages
  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Get unique users who have exchanged messages with the admin
        const { data: messageUsers, error: messagesError } = await supabase
          .from('messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
          
        if (messagesError) throw messagesError;
        
        if (!messageUsers || messageUsers.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Extract unique user IDs (excluding the admin)
        const userIds = new Set<string>();
        messageUsers.forEach(msg => {
          if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
          if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id);
        });
        
        if (userIds.size === 0) {
          setIsLoading(false);
          return;
        }
        
        // Get user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', Array.from(userIds));
          
        if (profilesError) throw profilesError;
        
        // Count unread messages for each user
        const usersWithUnreadCounts = await Promise.all((profiles || []).map(async (profile) => {
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', profile.id)
            .eq('receiver_id', user.id)
            .eq('is_read', false);
            
          return {
            ...profile,
            email: `user_${profile.id.substring(0, 8)}@example.com`, // Placeholder email
            unread_count: countError ? 0 : (count || 0)
          };
        }));
        
        setUsers(usersWithUnreadCounts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setIsLoading(false);
      }
    };
    
    fetchUsers();
    
    // Subscribe to new messages for realtime updates
    const channel = supabase
      .channel('admin-chat-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          // Refresh users list when new message arrives
          fetchUsers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  // Fetch messages for selected user
  useEffect(() => {
    if (!user || !selectedUser) return;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setMessages(data || []);
        
        // Mark messages as read
        const unreadMessages = (data || [])
          .filter(msg => msg.receiver_id === user.id && !msg.is_read)
          .map(msg => msg.id);
          
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages);
            
          // Update the user's unread count in the list
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.id === selectedUser.id ? { ...u, unread_count: 0 } : u
            )
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };
    
    fetchMessages();
    
    // Subscribe to message changes for this conversation
    const channel = supabase
      .channel(`chat-with-${selectedUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id}))`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !selectedUser || !newMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedUser.id,
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

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Customer Chat</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* User List */}
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
            
            <div className="h-[calc(100vh-300px)] overflow-y-auto">
              {filteredUsers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <li 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium flex justify-between items-center">
                        <span>{user.first_name} {user.last_name}</span>
                        {user.unread_count && user.unread_count > 0 && (
                          <span className="bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {user.unread_count}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden md:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                </div>
                
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto h-[calc(100vh-400px)] flex flex-col">
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
                                  Reply to:
                                </p>
                                <p className="truncate">
                                  {messages.find(m => m.id === message.reply_to)?.content || '...'}
                                </p>
                              </div>
                            )}
                            
                            <p>{message.content}</p>
                            
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
                                  className="h-5 w-5 ml-2 text-gray-500 hover:text-gray-700"
                                  onClick={() => handleReply(message)}
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
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
                        onClick={() => setReplyingTo(null)}
                      >
                        <X className="h-3 w-3" />
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
                      disabled={isSubmitting || !newMessage.trim()}
                    >
                      {isSubmitting ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Select a user to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
