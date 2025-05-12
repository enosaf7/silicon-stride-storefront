
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import UserTable from '@/components/Admin/UserTable';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  created_at: string;
  last_sign_in?: string;
  order_count?: number;
  role?: string;
  user_roles?: {
    role: string;
  }[];
}

const UserManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        toast.error('Failed to load user profiles');
        throw profilesError;
      }
      
      // Get user emails from auth.users (requires manual query as we can't access auth schema directly)
      const { data: userEmails } = await supabase.rpc('get_user_emails');
      
      // Get order counts
      const { data: orderCounts } = await supabase.rpc('get_user_order_counts');
      
      // Merge data
      const enrichedProfiles = profiles.map(profile => {
        const userEmail = userEmails?.find(u => u.id === profile.id);
        const orderCount = orderCounts?.find(o => o.user_id === profile.id);
        return {
          ...profile,
          email: userEmail?.email || '',
          order_count: orderCount?.count || 0,
          role: profile.user_roles?.[0]?.role || 'user'
        };
      });
      
      return enrichedProfiles as Profile[];
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
            users={profiles || []} 
            onRefresh={refetch}
            currentUserId={user.id}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
