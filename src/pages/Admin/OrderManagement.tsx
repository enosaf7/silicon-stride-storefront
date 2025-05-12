
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

interface Order {
  id: string;
  created_at: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: string;
  payment_intent: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const OrderManagement: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error('Failed to load orders');
        throw error;
      }
      
      return data as Order[];
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
