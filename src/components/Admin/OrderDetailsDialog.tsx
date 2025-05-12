
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  quantity: number;
  size: number;
  color: string | null;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface OrderUser {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface OrderDetails {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_address: string;
  payment_intent: string | null;
  user: OrderUser;
  items: OrderItem[];
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  onStatusChanged: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  onOpenChange,
  orderId,
  onStatusChanged,
}) => {
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      // Get basic order information
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        toast.error('Failed to load order details');
        throw orderError;
      }
      
      // Get user profile separately to avoid the relationship error
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', order.user_id)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        // Continue without profile data instead of failing
      }
      
      // Get order items with product details
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id (
            name,
            images
          )
        `)
        .eq('order_id', orderId);
        
      if (itemsError) {
        toast.error('Failed to load order items');
        throw itemsError;
      }
      
      // For now, we'll use a placeholder as we can't directly query auth.users
      const email = "customer@example.com"; // In a real scenario, this would be fetched from your auth system
      
      // Construct the order details object safely
      const userInfo: OrderUser = {
        first_name: profileData?.first_name || null,
        last_name: profileData?.last_name || null,
        email: email
      };
      
      return {
        ...order,
        user: userInfo,
        items: items || [],
      } as OrderDetails;
    },
    enabled: !!orderId && open,
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
  
  if (!orderId) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
                <p className="mt-2">
                  <strong>Order ID:</strong> {orderDetails.id}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(orderDetails.created_at).toLocaleDateString()} at{' '}
                  {new Date(orderDetails.created_at).toLocaleTimeString()}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge className={getStatusColor(orderDetails.status)}>
                    {orderDetails.status}
                  </Badge>
                </p>
                <p>
                  <strong>Payment ID:</strong>{' '}
                  {orderDetails.payment_intent || 'Not available'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                <p className="mt-2">
                  <strong>Name:</strong> {orderDetails.user.first_name} {orderDetails.user.last_name}
                </p>
                <p>
                  <strong>Email:</strong> {orderDetails.user.email}
                </p>
                <p>
                  <strong>Shipping Address:</strong> {orderDetails.shipping_address}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Order Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No items found for this order
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderDetails.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="w-12 h-12 relative">
                            <img
                              src={item.product?.images?.[0] || '/placeholder.svg'}
                              alt={item.product?.name}
                              className="rounded object-cover w-full h-full"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{item.product?.name || 'Unknown Product'}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.color || 'N/A'}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell colSpan={5}></TableCell>
                    <TableCell className="font-medium text-right">Total</TableCell>
                    <TableCell className="font-bold text-right">
                      ${orderDetails.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Order not found or could not be loaded
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
