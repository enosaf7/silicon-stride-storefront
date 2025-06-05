
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import ReviewTable from '@/components/Admin/ReviewTable';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Review } from '@/utils/types';

interface ExtendedReview extends Review {
  product?: {
    name: string;
  }
}

const ReviewManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          product:product_id (
            name
          )
        `)
        .order('date', { ascending: false });
        
      if (error) {
        toast.error('Failed to load reviews');
        throw error;
      }
      
      return data as ExtendedReview[];
    }
  });

  // Set up real-time subscription for reviews
  useEffect(() => {
    const channel = supabase
      .channel('admin-reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
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
        <h1 className="text-3xl font-bold mb-6">Review Management</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <ReviewTable 
            reviews={reviews || []} 
            onRefresh={refetch}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewManagement;
