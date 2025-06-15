
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
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  delivery_type?: 'delivery' | 'pickup';
  customer_name?: string;
  customer_phone?: string;
  shipping_fee?: number;
  region?: string;
  gps_coordinates?: string;
  created_at: string;
  updated_at: string;
}
