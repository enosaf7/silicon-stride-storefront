
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import UserProfileDialog from '@/components/Admin/UserProfile/UserProfileDialog';
import UserGrid from '@/components/Admin/UserManagement/UserGrid';
import { useUserData } from '@/components/Admin/UserManagement/useUserData';
import { Loader } from 'lucide-react';

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

const UserManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const { users, isLoading, refetch } = useUserData();

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setShowProfileDialog(true);
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
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <UserGrid 
          users={users}
          isLoading={isLoading}
          onUserClick={handleUserClick}
        />

        {/* User Profile Dialog */}
        <UserProfileDialog
          user={selectedUser}
          isOpen={showProfileDialog}
          onClose={() => {
            setShowProfileDialog(false);
            setSelectedUser(null);
          }}
          onRefresh={refetch}
        />
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
