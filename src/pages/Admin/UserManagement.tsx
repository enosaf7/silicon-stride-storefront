
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import UserProfileDialog from '@/components/Admin/UserProfileDialog';
import { Loader, User, MessageCircle, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get the profiles with all fields including phone and address
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        toast.error('Failed to load user profiles');
        throw profilesError;
      }
      
      // For each profile, get their role and order count
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          // Query user roles
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
            
          // Count orders for this user
          const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          return {
            ...profile,
            order_count: orderCount || 0,
            role: userRoles && userRoles.length > 0 ? userRoles[0].role : 'user'
          };
        })
      );
      
      return usersWithData as UserProfile[];
    }
  });

  // Set up real-time subscriptions for user-related changes
  useEffect(() => {
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
      )
      .subscribe();

    const userRolesChannel = supabase
      .channel('admin-user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(userRolesChannel);
    };
  }, [queryClient]);

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
        
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users?.map((userProfile) => (
              <Card 
                key={userProfile.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleUserClick(userProfile)}
              >
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${userProfile.email || userProfile.id}`}
                      alt="Profile Picture"
                    />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {userProfile.first_name || ''} {userProfile.last_name || ''}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{userProfile.email}</p>
                  </div>
                  <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'}>
                    {userProfile.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      {userProfile.order_count} orders
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
            ))}
          </div>
        )}

        {users && users.length === 0 && (
          <div className="text-center py-10">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        )}

        {/* User Profile Dialog */}
        <UserProfileDialog
          user={selectedUser}
          isOpen={showProfileDialog}
          onClose={() => {
            setShowProfileDialog(false);
            setSelectedUser(null);
          }}
          onRefresh={refetch}
          currentAdminId={user.id}
        />
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
