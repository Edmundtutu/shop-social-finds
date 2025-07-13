import { AuthUser } from './auth';
import { Product } from './products';

export interface Review {
  id: string;
  user_id: string;
  user: AuthUser;
  product_id?: string;
  product?: Product;
  shop_id?: string;
  shop?: Shop;
  rating: number;
  comment?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  user: AuthUser;
  content: string;
  images: string[];
  product_id?: string;
  product?: Product;
  shop_id?: string;
  shop?: Shop;
  likes_count: number;
  comments_count: number;
  liked_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user: AuthUser;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  avatar?: string;
  cover_image?: string;
  owner_id: string;
  owner: AuthUser;
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