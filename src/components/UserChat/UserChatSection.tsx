
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import UserChatDialog from './UserChatDialog';

const UserChatSection: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Chat with our support team for any questions or assistance.
        </p>
        <UserChatDialog userId={user.id} />
      </CardContent>
    </Card>
  );
};

export default UserChatSection;
