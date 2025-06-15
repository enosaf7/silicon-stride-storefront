
import React, { useState } from 'react';
import { 
  Table,
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatCedi } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_address: string;
  payment_intent: string | null;
  tracking_number?: string;
  processed_by?: {
    first_name: string;
    last_name: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface OrderTableProps {
  orders: Order[];
  onViewDetails: (orderId: string) => void;
  onRefresh: () => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onViewDetails, onRefresh }) => {
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-orange-100 text-orange-800';
      case 'payment_confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery':
        return 'bg-cyan-100 text-cyan-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateTrackingNumber = () => {
    return 'SH' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
  };

  const createNotification = async (userId: string, title: string, message: string, orderId: string) => {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: 'order_status',
          related_id: orderId,
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleProceedPayment = async (orderId: string) => {
    setProcessingOrders(prev => new Set(prev).add(orderId));

    try {
      const otp = generateOTP();
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'payment_confirmed',
          otp_code: otp,
          processed_by_admin: user?.id
        })
        .eq('id', orderId);
        
      if (error) throw error;

      // Get order details for notification
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (orderData) {
        await createNotification(
          orderData.user_id,
          'Payment Confirmed',
          `Your payment has been confirmed. OTP: ${otp}`,
          orderId
        );
      }
      
      toast.success(`Payment confirmed! OTP sent to customer: ${otp}`);
      onRefresh();
    } catch (error: any) {
      toast.error(`Failed to confirm payment: ${error.message}`);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const reduceProductStock = async (orderId: string) => {
    try {
      // Get order items for this order
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (orderItemsError) throw orderItemsError;

      // Update stock for each product
      for (const item of orderItems) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (productError) throw productError;

        const newStock = Math.max(0, product.stock - item.quantity);

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error reducing stock:', error);
      throw error;
    }
  };
  
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        processed_by_admin: user?.id
      };

      // Add tracking number when shipped
      if (newStatus === 'shipped' && !orders.find(o => o.id === orderId)?.tracking_number) {
        updateData.tracking_number = generateTrackingNumber();
      }

      // Add timestamps
      if (newStatus === 'packed') {
        updateData.packed_at = new Date().toISOString();
      } else if (newStatus === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
        
      if (error) throw error;

      // Reduce stock when order is shipped or delivered
      if (newStatus === 'shipped' || newStatus === 'delivered') {
        await reduceProductStock(orderId);
      }

      // Get order details for notification
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id, tracking_number')
        .eq('id', orderId)
        .single();

      if (orderData) {
        let notificationMessage = `Your order status has been updated to: ${newStatus.replace('_', ' ')}`;
        
        if (newStatus === 'shipped' && updateData.tracking_number) {
          notificationMessage += `. Tracking number: ${updateData.tracking_number}`;
        }

        await createNotification(
          orderData.user_id,
          'Order Status Update',
          notificationMessage,
          orderId
        );
      }
      
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}${(newStatus === 'shipped' || newStatus === 'delivered') ? ' and stock reduced' : ''}`);
      onRefresh();
    } catch (error: any) {
      toast.error(`Failed to update order status: ${error.message}`);
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Processed By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {order.profiles
                      ? `${order.profiles.first_name} ${order.profiles.last_name}`
                      : 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCedi(order.total)}
                  </TableCell>
                  <TableCell>
                    {order.status === 'pending_payment' ? (
                      <Badge className={getStatusColor(order.status)}>
                        Awaiting Payment
                      </Badge>
                    ) : (
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`w-[150px] ${getStatusColor(order.status)}`}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="packed">Packed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.tracking_number ? (
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {order.tracking_number}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.processed_by ? (
                      <span className="text-sm text-gray-600">
                        {order.processed_by.first_name} {order.processed_by.last_name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not processed</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {order.status === 'pending_payment' && (
                        <Button
                          size="sm"
                          onClick={() => handleProceedPayment(order.id)}
                          disabled={processingOrders.has(order.id)}
                          className="bg-brand-orange hover:bg-brand-orange/90"
                        >
                          {processingOrders.has(order.id) ? (
                            'Processing...'
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Proceed
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderTable;
