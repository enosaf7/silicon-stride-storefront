
import React from 'react';
import { User, Loader } from 'lucide-react';
import UserCard from './UserCard';

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

interface UserGridProps {
  users: UserProfile[] | undefined;
  isLoading: boolean;
  onUserClick: (user: UserProfile) => void;
}

const UserGrid: React.FC<UserGridProps> = ({ users, isLoading, onUserClick }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (users && users.length === 0) {
    return (
      <div className="text-center py-10">
        <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No users found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users?.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onUserClick={onUserClick}
        />
      ))}
    </div>
  );
};

export default UserGrid;
