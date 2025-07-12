export interface User {
  id: number;
  name: string;
  email: string;
  role: 'guest' | 'customer' | 'influencer' | 'vendor';
  avatar?: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: number;
  name: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  avatar?: string;
  cover_image?: string;
  owner_id: number;
  owner: User;
  rating: number;
  total_reviews: number;
  phone?: string;
  hours?: {
    [key: string]: { open: string; close: string } | null;
  };
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  shop_id: number;
  shop: Shop;
  stock: number;
  rating: number;
  total_reviews: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  user: User;
  product_id?: number;
  product?: Product;
  shop_id?: number;
  shop?: Shop;
  rating: number;
  comment?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  user: User;
  content: string;
  images: string[];
  product_id?: number;
  product?: Product;
  shop_id?: number;
  shop?: Shop;
  likes_count: number;
  comments_count: number;
  liked_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  user_id: number;
  user: User;
  post_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  user: User;
  shop_id: number;
  shop: Shop;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  delivery_type: 'pickup' | 'delivery';
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}