import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Paperclip } from 'lucide-react';

const ADMIN_ID = 'admin';

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch users who have chatted with admin
  const fetchUsers = async () => {
    setIsLoading(true);
    const { data: msgData } = await supabase
      .from('messages')
      .select('sender_id,receiver_id')
      .or(`sender_id.eq.${ADMIN_ID},receiver_id.eq.${ADMIN_ID}`);
    if (!msgData) {
      setUsers([]);
      setIsLoading(false);
      return;
    }
    const userIds = [
      ...new Set(
        msgData
          .map((msg) =>
            msg.sender_id !== ADMIN_ID ? msg.sender_id : msg.receiver_id
          )
          .filter((id) => id && id !== ADMIN_ID)
      ),
    ];
    if (userIds.length === 0) {
      setUsers([]);
      setIsLoading(false);
      return;
    }
    const { data: userRows } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    setUsers(userRows || []);
    setIsLoading(false);
  };

  // Fetch messages with selected user
  const fetchMessages = async (userId) => {
    if (!userId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${ADMIN_ID})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setIsLoading(false);
    // Mark all user's unread messages as read
    const unread = (data || []).filter(
      (msg) => msg.receiver_id === ADMIN_ID && !msg.is_read
    );
    if (unread.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unread.map((msg) => msg.id));
    }
  };

  useEffect(() => {
    fetchUsers();
    const channel = supabase
      .channel('admin-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${ADMIN_ID}`
      }, fetchUsers)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    fetchMessages(selectedUser.id);
    const channel = supabase
      .channel(`admin-chat-${selectedUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${ADMIN_ID},sender_id=eq.${selectedUser.id}`
      }, () => fetchMessages(selectedUser.id))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${ADMIN_ID},receiver_id=eq.${selectedUser.id}`
      }, () => fetchMessages(selectedUser.id))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const uploadMedia = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${ADMIN_ID}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = await supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !mediaFile) || !selectedUser) return;
    setIsSending(true);

    let mediaUrl = null;
    if (mediaFile) {
      try {
        mediaUrl = await uploadMedia(mediaFile);
      } catch (err) {
        alert('Failed to upload media.');
        setIsSending(false);
        return;
      }
    }

    await supabase.from('messages').insert({
      sender_id: ADMIN_ID,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
      is_read: false,
      media_url: mediaUrl,
    });
    setNewMessage('');
    setMediaFile(null);
    setIsSending(false);
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">User Chats</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* User List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-[calc(100vh-300px)] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full py-10">
                  <Loader className="h-8 w-8 animate-spin text-brand-orange" />
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
                      <div className="font-medium flex justify-between items-center">
                        <span>{user.first_name} {user.last_name}</span>
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
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                </div>
                <div className="flex-grow p-4 overflow-y-auto h-[calc(100vh-400px)] flex flex-col">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="h-8 w-8 animate-spin text-brand-orange" />
                    </div>
                  ) : (
                    <>
                      {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-4">No messages yet.</div>
                      )}
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-2 flex ${message.sender_id === ADMIN_ID ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`rounded-lg px-3 py-2 ${message.sender_id === ADMIN_ID ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-900'}`}>
                            {message.media_url && (
                              <div className="mb-1">
                                {message.media_url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                  <img src={message.media_url} alt="media" className="max-w-xs max-h-44 rounded mb-1" />
                                ) : message.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video controls src={message.media_url} className="max-w-xs max-h-44 rounded mb-1" />
                                ) : (
                                  <a href={message.media_url} target="_blank" rel="noopener noreferrer" className="underline">View file</a>
                                )}
                              </div>
                            )}
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs text-right text-gray-600 mt-1">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                <form onSubmit={handleSend} className="flex gap-2 items-center p-4 border-t border-gray-200">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    disabled={isSending}
                    style={{ flex: 1 }}
                  />
                  <label className="cursor-pointer">
                    <Paperclip />
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={e => setMediaFile(e.target.files[0])} />
                  </label>
                  <Button type="submit" disabled={isSending || (!newMessage.trim() && !mediaFile)}>
                    Send
                  </Button>
                </form>
                {mediaFile && (
                  <div className="text-xs mt-1 text-gray-700 flex items-center gap-1 px-4 pb-2">
                    <span>Selected:</span>
                    <span className="font-semibold">{mediaFile.name}</span>
                    <button type="button" onClick={() => setMediaFile(null)} className="text-red-500 ml-2">Remove</button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span>Select a user to start chatting.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
