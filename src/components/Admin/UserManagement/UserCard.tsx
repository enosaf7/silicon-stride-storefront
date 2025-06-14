
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, ShoppingBag, MessageCircle } from 'lucide-react';

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

interface UserCardProps {
  user: UserProfile;
  onUserClick: (user: UserProfile) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onUserClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onUserClick(user)}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage 
            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${user.email || user.id}`}
            alt="Profile Picture"
          />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">
            {user.first_name || ''} {user.last_name || ''}
          </CardTitle>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(user.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-1" />
            {user.order_count} orders
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center text-brand-orange text-sm font-medium">
            <MessageCircle className="h-4 w-4 mr-1" />
            Click to view profile & chat
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
