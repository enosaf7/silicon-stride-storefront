
-- Create wishlists table for user favorites
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add Row Level Security (RLS) to wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlist items" 
  ON public.wishlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" 
  ON public.wishlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" 
  ON public.wishlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'order_status', 'low_stock', 'promotion', etc.
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID, -- Can reference orders, products, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create product_views table for tracking viewed products
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  product_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to product_views
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own product views" 
  ON public.product_views 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can add their own product views" 
  ON public.product_views 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add additional fields to orders table for enhanced tracking
ALTER TABLE public.orders 
ADD COLUMN tracking_number TEXT,
ADD COLUMN estimated_delivery_date DATE,
ADD COLUMN packed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;

-- Create inventory_logs table for stock change tracking
CREATE TABLE public.inventory_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  change_amount INTEGER NOT NULL, -- positive for additions, negative for reductions
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'sale', 'restock', 'adjustment', etc.
  admin_id UUID, -- Who made the change (if admin)
  order_id UUID, -- If related to an order
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to inventory_logs (admin only)
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view inventory logs" 
  ON public.inventory_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add low_stock_threshold to products table
ALTER TABLE public.products 
ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;

-- Create function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if stock actually changed
  IF OLD.stock != NEW.stock THEN
    INSERT INTO public.inventory_logs (
      product_id,
      change_amount,
      previous_stock,
      new_stock,
      reason,
      admin_id
    ) VALUES (
      NEW.id,
      NEW.stock - OLD.stock,
      OLD.stock,
      NEW.stock,
      CASE 
        WHEN NEW.stock > OLD.stock THEN 'restock'
        WHEN NEW.stock < OLD.stock THEN 'adjustment'
        ELSE 'unknown'
      END,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for inventory logging
CREATE TRIGGER log_inventory_changes
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_change();

-- Create function to get product recommendations
CREATE OR REPLACE FUNCTION get_product_recommendations(target_user_id UUID DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  price NUMERIC,
  images TEXT[],
  rating NUMERIC,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    p.images,
    p.rating,
    COALESCE(pv.view_count, 0) as view_count
  FROM public.products p
  LEFT JOIN (
    SELECT 
      product_id, 
      COUNT(*) as view_count
    FROM public.product_views 
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY product_id
  ) pv ON p.id = pv.product_id
  WHERE p.stock > 0
  ORDER BY 
    CASE 
      WHEN target_user_id IS NOT NULL THEN 
        -- Prioritize products from categories the user has viewed/ordered
        (SELECT COUNT(*) FROM public.product_views pv2 
         JOIN public.products p2 ON pv2.product_id = p2.id 
         WHERE pv2.user_id = target_user_id AND p2.category = p.category)
      ELSE 0
    END DESC,
    pv.view_count DESC,
    p.rating DESC NULLS LAST,
    p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
