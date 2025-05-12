
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
