
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  profiles?: Profile;
}

const OrderManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      // First get the orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ordersError) {
        toast.error('Failed to load orders');
        throw ordersError;
      }
      
      // Then get the profiles separately
      const enhancedOrders = await Promise.all(
        ordersData.map(async (order) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', order.user_id)
            .single();
            
          return {
            ...order,
            profiles: profileData || { first_name: null, last_name: null }
          };
        })
      );
      
      return enhancedOrders as Order[];
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
  
  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>
        
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
