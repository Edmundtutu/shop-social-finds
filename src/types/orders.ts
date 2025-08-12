import { Product } from "./products";
import { Shop } from "./shops";
import { User } from "./users";

export interface CreateOrderItemPayload {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  shop_id: number;
  items: CreateOrderItemPayload[];
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  notes?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  product?: Product; // Nested product details
}

export interface Order {
  id: number;
  user_id: number;
  shop_id: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user?: User; // Nested user details for vendor orders
  shop?: Shop;
}
