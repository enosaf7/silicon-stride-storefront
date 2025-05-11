
export interface Product {
  id: string;
  name: string;
  category: 'shoes' | 'slippers' | 'boots' | 'sandals';
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
  productId: string;
  quantity: number;
  size: number;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}
