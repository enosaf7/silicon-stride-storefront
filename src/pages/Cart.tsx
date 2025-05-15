
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatCedi } from '@/lib/utils';

const Cart: React.FC = () => {
  const { 
    cartItems, 
    isLoading, 
    updateQuantity, 
    removeFromCart,
    subtotal,
    shippingCost,
    totalCost,
    itemCount,
    clearCart
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (isLoading) {
    return (
      <>
        <NavBar />
        <main className="py-12 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading your cart...</h1>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: totalCost,
          shipping_address: 'Default Address', // This would come from user profile or form
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      if (!orderData || !orderData.id) {
        throw new Error('Failed to create order - no order ID returned');
      }

      console.log('Order created successfully:', orderData);

      // 2. Create order items
      const orderItems = cartItems.map(item => {
        if (!item.product) {
          console.error('Missing product data for cart item:', item);
          return null;
        }

        const itemPrice = item.product.discount
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price || 0;

        return {
          order_id: orderData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: itemPrice
        };
      }).filter(Boolean);

      if (orderItems.length === 0) {
        throw new Error('No valid order items to create');
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      // 3. Send invoice emails (wrapped in try/catch to continue even if this fails)
      try {
        const { data: invoiceData, error: invoiceError } = await supabase.functions
          .invoke('send-invoice', {
            body: { 
              orderId: orderData.id,
              userId: user.id
            }
          });

        if (invoiceError) {
          console.error('Invoice error:', invoiceError);
        } else {
          console.log('Invoice sent successfully:', invoiceData);
        }
      } catch (invoiceErr) {
        console.error('Failed to send invoice, but order was created:', invoiceErr);
      }

      // 4. Clear cart after successful order
      await clearCart();
      console.log('Cart cleared successfully');

      // 5. Show success message and redirect
      toast.success('Order placed successfully!');
      
      // Redirect back to home page
      setTimeout(() => {
        navigate('/');
        toast.info('Order confirmation has been sent to your email');
      }, 2000);

    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place order: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <NavBar />
      <main className="py-12 min-h-screen bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Cart Header */}
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Cart Items ({itemCount})</h2>
                  </div>
                  
                  {/* Cart Items */}
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => {
                      if (!item.product) return null;
                      
                      const itemPrice = item.product.discount
                        ? item.product.price * (1 - item.product.discount / 100)
                        : item.product.price;
                        
                      return (
                        <div key={item.id} className="p-6 flex flex-col md:flex-row">
                          {/* Product Image */}
                          <div className="md:w-24 md:h-24 rounded overflow-hidden mb-4 md:mb-0">
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="md:ml-6 flex-grow">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium text-lg">
                                  <Link to={`/product/${item.product_id}`} className="hover:text-brand-orange">
                                    {item.product.name}
                                  </Link>
                                </h3>
                                <p className="text-gray-500 text-sm">
                                  Size: {item.size} | Color: 
                                  <span 
                                    className="inline-block w-3 h-3 ml-1 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                </p>
                              </div>
                              
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                            
                            {/* Price and Quantity */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
                              <div className="flex items-center mb-3 sm:mb-0">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-l-md flex items-center justify-center"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <div className="w-10 h-8 border-t border-b border-gray-300 flex items-center justify-center">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-r-md flex items-center justify-center"
                                  disabled={item.quantity >= (item.product?.stock || 0)}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              
                              <div className="font-semibold text-lg">
                                {formatCedi(itemPrice * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCedi(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        {shippingCost === 0 ? 'Free' : formatCedi(shippingCost)}
                      </span>
                    </div>
                    
                    <div className="h-px bg-gray-200"></div>
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCedi(totalCost)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-brand-orange hover:bg-brand-orange/90"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || cartItems.length === 0}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⟳</span> Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" /> Place Order
                      </span>
                    )}
                  </Button>
                  
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    By placing an order, you'll receive an invoice via email.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-brand-orange bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-brand-orange" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/products">
                <Button className="bg-brand-orange hover:bg-brand-orange/90">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
