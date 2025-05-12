
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import UserTable from '@/components/Admin/UserTable';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  last_sign_in?: string;
  order_count: number;
  role: string;
}

const UserManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get the profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        toast.error('Failed to load user profiles');
        throw profilesError;
      }
      
      // For each profile, get their role
      const usersWithRoles = await Promise.all(
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
          
          // We don't have direct access to auth.users for email
          // In a real app, you'd need to implement this properly
          const mockEmail = `${profile.first_name || 'user'}.${profile.last_name || profile.id.substring(0,4)}@example.com`;
          
          return {
            ...profile,
            email: mockEmail,
            order_count: orderCount || 0,
            role: userRoles && userRoles.length > 0 ? userRoles[0].role : 'user'
          };
        })
      );
      
      return usersWithRoles as User[];
    }
  });
  
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
          <UserTable 
            users={users || []} 
            onRefresh={refetch}
            currentUserId={user.id}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
