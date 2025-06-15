
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { WishlistItem } from '@/utils/types';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refetch: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;
      
      toast.success('Added to wishlist');
      await fetchWishlist();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Item already in wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      toast.success('Removed from wishlist');
      await fetchWishlist();
    } catch (error: any) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refetch: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
