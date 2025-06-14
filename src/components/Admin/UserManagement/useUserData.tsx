
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useUserData = () => {
  const queryClient = useQueryClient();

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

  return { users, isLoading, refetch };
};
