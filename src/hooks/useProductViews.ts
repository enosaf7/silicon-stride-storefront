
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProductViews = () => {
  const { user } = useAuth();

  const trackProductView = async (productId: string) => {
    try {
      await supabase
        .from('product_views')
        .insert({
          user_id: user?.id || null,
          product_id: productId,
        });
    } catch (error) {
      // Silently fail - view tracking shouldn't interrupt user experience
      console.log('Failed to track product view:', error);
    }
  };

  return { trackProductView };
};
