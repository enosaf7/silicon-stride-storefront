
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader, MessageSquare, Users, User } from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  message_count: number;
  last_message_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const AdminChat: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, navigate, isLoading]);

  // Fetch users who have sent messages to admin
  useEffect(() => {
    if (!user || !isAdmin) return;
    
    const fetchUserProfiles = async () => {
      try {
        setIsLoading(true);
        
        // Get all messages sent to this admin
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('sender_id, created_at')
          .eq('receiver_id', user.id);
          
        if (messagesError) throw messagesError;
        
        if (!messagesData || messagesData.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Get unique sender IDs and count messages
        const senderStats = messagesData.reduce((acc: any, msg: any) => {
          if (!acc[msg.sender_id]) {
            acc[msg.sender_id] = {
              count: 0,
              lastMessageAt: msg.created_at
            };
          }
          acc[msg.sender_id].count++;
          if (new Date(msg.created_at) > new Date(acc[msg.sender_id].lastMessageAt)) {
            acc[msg.sender_id].lastMessageAt = msg.created_at;
          }
          return acc;
        }, {});
        
        const senderIds = Object.keys(senderStats);
        
        if (senderIds.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Get user profiles for these senders
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', senderIds);
          
        if (profilesError) throw profilesError;
        
        // Combine profile data with message stats
        const userProfilesWithStats: UserProfile[] = (profiles || []).map(profile => ({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          message_count: senderStats[profile.id].count,
          last_message_at: senderStats[profile.id].lastMessageAt
        }));
        
        // Sort by last message time
        userProfilesWithStats.sort((a, b) => 
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );
        
        setUserProfiles(userProfilesWithStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
        toast.error('Failed to load user profiles');
        setIsLoading(false);
      }
    };
    
    fetchUserProfiles();
  }, [user, isAdmin]);

  // Fetch messages for selected user
  const fetchMessagesForUser = async (userId: string) => {
    if (!user) return;
    
    setIsLoadingMessages(true);
    
    try {
      // Get conversation messages between admin and user
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read
      const unreadMessages = (data || [])
        .filter((msg: any) => msg.receiver_id === user.id && !msg.is_read)
        .map((msg: any) => msg.id);
        
      if (unreadMessages.length > 0) {
        await supabase.rpc('mark_messages_as_read', {
          user_id: user.id,
          message_ids: unreadMessages
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleUserSelect = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    fetchMessagesForUser(userProfile.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* User Profiles List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users with Messages
              </h2>
            </div>
            
            <div className="h-[calc(100vh-300px)] overflow-y-auto">
              {userProfiles.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {userProfiles.map(userProfile => (
                    <li 
                      key={userProfile.id}
                      onClick={() => handleUserSelect(userProfile)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === userProfile.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900">
                            {userProfile.first_name} {userProfile.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userProfile.message_count} message{userProfile.message_count !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-400">
                            Last: {formatDate(userProfile.last_message_at)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No messages yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold">
                    Chat with {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                </div>
                
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto h-[calc(100vh-400px)]">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="h-6 w-6 animate-spin text-brand-orange" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`p-3 rounded-lg max-w-[80%] ${
                              message.sender_id === user?.id 
                                ? 'bg-brand-orange text-white' 
                                : 'bg-gray-100'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === user?.id 
                                ? 'text-white/70' 
                                : 'text-gray-500'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages yet
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Select a user to view their messages</p>
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
