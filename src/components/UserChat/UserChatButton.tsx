
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserChatDialog from './UserChatDialog';

const UserChatButton: React.FC = () => {
  const { user } = useAuth();

  // Only show for logged-in users who are not admins
  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <UserChatDialog userId={user.id} />
    </div>
  );
};

export default UserChatButton;
