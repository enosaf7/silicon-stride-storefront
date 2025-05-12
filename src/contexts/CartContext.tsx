
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/utils/types';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size: number;
  color?: string;
  product?: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity: number, size: number, color?: string) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  shippingCost: number;
  totalCost: number;
  itemCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => {
    if (!item.product) return total;
    
    const itemPrice = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
      
    return total + (itemPrice * item.quantity);
  }, 0);
  
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const totalCost = subtotal + shippingCost;
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      // Fetch product details for each cart item
      if (cartData && cartData.length > 0) {
        const productIds = cartData.map(item => item.product_id);
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productError) throw productError;

        // Merge product details with cart items
        const cartWithProducts = cartData.map(cartItem => {
          const product = productData.find(p => p.id === cartItem.product_id);
          return { ...cartItem, product };
        });

        setCartItems(cartWithProducts);
      } else {
        setCartItems([]);
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const addToCart = async (productId: string, quantity: number, size: number, color?: string) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      // Check if product exists and has enough stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      
      if (!product) {
        toast.error('Product not found');
        return;
      }

      if (product.stock < quantity) {
        toast.error(`Only ${product.stock} items available`);
        return;
      }

      // Check if item already exists in cart
      const { data: existingItems, error: existingError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size)
        .eq('color', color || null);

      if (existingError) throw existingError;

      if (existingItems && existingItems.length > 0) {
        // Update existing item
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > product.stock) {
          toast.error(`Cannot add more items. Only ${product.stock} available in stock.`);
          return;
        }

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([
            {
              user_id: user.id,
              product_id: productId,
              quantity,
              size,
              color
            }
          ]);

        if (insertError) throw insertError;
      }

      toast.success('Item added to cart');
      await fetchCartItems();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      // Find the item
      const item = cartItems.find(i => i.id === itemId);
      if (!item) {
        toast.error('Item not found in cart');
        return;
      }

      // Check stock
      if (item.product && newQuantity > item.product.stock) {
        toast.error(`Only ${item.product.stock} items available`);
        return;
      }

      if (newQuantity <= 0) {
        return removeFromCart(itemId);
      }

      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      toast.success('Cart updated');
    } catch (error: any) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const refreshCart = async () => {
    return fetchCartItems();
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      shippingCost,
      totalCost,
      itemCount,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
