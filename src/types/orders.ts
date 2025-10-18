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
  // Payment fields
  payment_method?: 'card' | 'mobilemoneyuganda' | 'momo';
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
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

export interface Payment {
  id: string;
  payer_id: string;
  payee_id: string;
  order_id: string;
  tx_ref: string;
  amount: number;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: string; // ULID
  shop_id: string; // ULID
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shop?: Shop; 
  user?: AuthUser;
  payment?: Payment;
}

export interface CreateOrderWithPaymentResponse {
  order: Order;
  payment_url?: string;
  payment_data?: any;
  message: string;
}
