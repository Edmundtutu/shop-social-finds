import { AuthUser } from './auth';
import { Shop } from './shops';

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