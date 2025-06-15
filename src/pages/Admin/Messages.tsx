
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MailOpen, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string | null;
}

const Messages: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      toast.success('Message marked as read');
    },
    onError: (error) => {
      console.error('Error marking message as read:', error);
      toast.error('Failed to mark message as read');
    },
  });

  const handleMarkAsRead = (messageId: string) => {
    markAsReadMutation.mutate(messageId);
  };

  const unreadCount = messages?.filter(msg => !msg.is_read).length || 0;

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Contact Messages</h1>
            <p className="text-gray-600 mt-2">
              Manage messages from the contact form ({unreadCount} unread)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">All Messages</h2>
              {messages?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <Mail className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <p>No contact messages yet.</p>
                  </CardContent>
                </Card>
              ) : (
                messages?.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'ring-2 ring-brand-orange' : ''
                    } ${!message.is_read ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {message.is_read ? (
                            <MailOpen className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Mail className="h-4 w-4 text-blue-500" />
                          )}
                          <CardTitle className="text-sm font-medium">
                            {message.name}
                          </CardTitle>
                          {!message.is_read && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                      <p className="text-sm font-medium mb-2">
                        {message.subject || 'No Subject'}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {message.message}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Message Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Message Details</h2>
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedMessage.name}
                      </CardTitle>
                      {!selectedMessage.is_read && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{selectedMessage.email}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject</label>
                      <p className="text-sm">{selectedMessage.subject || 'No Subject'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p className="text-sm">
                        {format(new Date(selectedMessage.created_at), 'MMMM dd, yyyy at HH:mm')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedMessage.is_read ? (
                          <>
                            <MailOpen className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Read</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">Unread</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Message</label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <Mail className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <p>Select a message to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Messages;
