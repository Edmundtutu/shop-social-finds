import type { Product } from "./products";
import type { Shop } from "./shops";
import type { AuthUser } from "./auth";

export interface CreateOrderAddOnPayload {
  product_id: string;
  quantity: number;
  original_price: number;
  discounted_price: number;
}

export interface CreateOrderItemPayload {
  product_id: string; // ULID
  quantity: number;
  base_price?: number;
  add_ons?: CreateOrderAddOnPayload[];
  item_total?: number;
  package_savings?: number;
}

export interface CreateOrderPayload {
  shop_id: string; // ULID
  items: CreateOrderItemPayload[];
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  notes?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: string; // ULID
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  product?: Product; // Nested product details
}

export interface Order {
  id: number;
  user_id: string; // ULID
  shop_id: string; // ULID
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user?: AuthUser; // Nested user details for vendor orders
  shop?: Shop;
}
