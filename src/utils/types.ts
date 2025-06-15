
export interface Product {
  id: string;
  name: string;
  category: string; // Changed from enum to string to match Supabase data
  price: number;
  images: string[];
  description: string;
  sizes: number[];
  colors: string[];
  stock: number;
  featured?: boolean;
  newArrival?: boolean;
  discount?: number;
  rating?: number;
  // Add fields that might come from Supabase
  created_at?: string;
  updated_at?: string;
  new_arrival?: boolean;
  low_stock_threshold?: number;
}

export interface Review {
  id: string;
  user_id: string;
  username: string;
  product_id: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  id?: string;
  productId?: string;
  product_id?: string; // For Supabase compatibility
  quantity: number;
  size: number;
  color?: string;
  product?: Product;
  user_id?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface SearchFilters {
  query: string;
  category?: string;
  priceRange?: [number, number];
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface ShippingData {
  deliveryType: 'delivery' | 'pickup';
  fullName: string;
  phone: string;
  address: string;
  gpsAddress: string;
  coordinates: [number, number] | null;
  shippingFee: number;
  region: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  shipping_address: string;
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'payment_confirmed' | 'packed' | 'out_for_delivery';
  delivery_type?: 'delivery' | 'pickup';
  customer_name?: string;
  customer_phone?: string;
  shipping_fee?: number;
  region?: string;
  gps_coordinates?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  packed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_status' | 'low_stock' | 'promotion' | 'general';
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export interface ProductView {
  id: string;
  user_id?: string;
  product_id: string;
  viewed_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  change_amount: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  admin_id?: string;
  order_id?: string;
  created_at: string;
}
