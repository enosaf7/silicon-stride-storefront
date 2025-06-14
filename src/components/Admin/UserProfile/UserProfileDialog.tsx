
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UserProfileInfo from './UserProfileInfo';
import ChatSection from './ChatSection';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  order_count: number;
  role: string;
}

interface UserProfileDialogProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  currentAdminId: string;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  user,
  isOpen,
  onClose,
  onRefresh,
  currentAdminId
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* User Profile Information */}
          <UserProfileInfo user={user} />

          {/* Chat Section */}
          <ChatSection
            userId={user.id}
            currentAdminId={currentAdminId}
            isOpen={isOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
