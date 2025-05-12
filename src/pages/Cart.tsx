
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Phone } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Cart: React.FC = () => {
  const { 
    cartItems, 
    isLoading, 
    updateQuantity, 
    removeFromCart,
    subtotal,
    shippingCost,
    totalCost,
    itemCount
  } = useCart();
  
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
                                ${(itemPrice * item.quantity).toFixed(2)}
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
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div className="h-px bg-gray-200"></div>
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Link to="/checkout">
                      <Button className="w-full bg-brand-orange hover:bg-brand-orange/90">
                        Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Link to="/momo-checkout">
                      <Button className="w-full" variant="outline">
                        Pay with Mobile Money
                        <Phone className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
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
