
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag
} from 'lucide-react';

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

interface UserProfileInfoProps {
  user: UserProfile;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${user.email || user.id}`}
            alt="Profile Picture"
          />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <span className="text-xl font-semibold">
            {user.first_name || ''} {user.last_name || ''}
          </span>
          <Badge className="ml-2" variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{user.email || 'No email provided'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{user.phone || 'No phone provided'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{user.address || 'No address provided'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            Joined {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{user.order_count} total orders</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
