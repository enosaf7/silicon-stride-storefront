
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const RecentOrders: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          status, 
          total,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data as Order[];
    }
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button 
          variant="link" 
          className="text-brand-orange"
          onClick={() => navigate('/admin/orders')}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No orders found</div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">
                    {order.profiles?.first_name} {order.profiles?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="font-bold">${order.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
