import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Admin/AdminLayout';
import OrderTable from '@/components/Admin/OrderTable';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import OrderDetailsDialog from '@/components/Admin/OrderDetailsDialog';

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

interface Order {
  id: string;
  created_at: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: string;
  payment_intent: string | null;
  processed_by_admin: string | null;
  profiles?: Profile;
  processed_by?: Profile;
}

const OrderManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      // Fetch all orders (not filtered by admin)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        toast.error('Failed to load orders');
        throw ordersError;
      }

      // Attach customer and admin profiles to each order
      const enhancedOrders = await Promise.all(
        ordersData.map(async (order) => {
          // Customer profile
          const { data: customerProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', order.user_id)
            .single();

          // Processing admin profile, if exists
          let processingAdminProfile = null;
          if (order.processed_by_admin) {
            const { data: adminProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', order.processed_by_admin)
              .single();
            processingAdminProfile = adminProfile;
          }

          return {
            ...order,
            profiles: customerProfile || { first_name: null, last_name: null },
            processed_by: processingAdminProfile,
          };
        })
      );

      return enhancedOrders as Order[];
    },
  });

  // Listen for real-time order changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
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

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-600 mt-2">
            Shared dashboard for all admins - All order changes are visible to all administrators in real-time.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <OrderTable
            orders={orders || []}
            onViewDetails={handleViewOrderDetails}
            onRefresh={refetch}
          />
        )}

        <OrderDetailsDialog
          open={!!selectedOrderId}
          onOpenChange={(open) => {
            if (!open) setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onStatusChanged={refetch}
        />
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
