import { AuthUser } from './auth';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  shop_id: string;
  shop: Shop;
  stock: number;
  rating: number;
  total_reviews: number;
  tags: string[];
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