import api from './api';
import { CreateOrderPayload, Order, CreateOrderWithPaymentResponse } from '@/types/orders';
import type { ApiResponse } from '@/types/api';

const apiVersion = import.meta.env.VITE_API_VERSION;

export const createOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
  const response = await api.post<ApiResponse<Order>>(`${apiVersion}/orders`, orderData);
  return response.data.data;
};

export const createOrderWithPayment = async (orderData: CreateOrderPayload): Promise<CreateOrderWithPaymentResponse> => {
  const response = await api.post<ApiResponse<CreateOrderWithPaymentResponse>>(`${apiVersion}/orders/with-payment`, orderData);
  
  // Handle both old and new response formats
  if (response.data.data) {
    return response.data.data;
  }
  
  // Fallback for direct response format
  return response.data as unknown as CreateOrderWithPaymentResponse;
};

export const createOrderWithUnifiedPayment = async (orderData: CreateOrderPayload): Promise<CreateOrderWithPaymentResponse> => {
  const response = await api.post<ApiResponse<CreateOrderWithPaymentResponse>>(`${apiVersion}/orders/with-unified-payment`, orderData);
  
  // Handle both old and new response formats
  if (response.data.data) {
    return response.data.data;
  }
  
  // Fallback for direct response format
  return response.data as unknown as CreateOrderWithPaymentResponse;
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<ApiResponse<Order[]>>(`${apiVersion}/orders`);
  return (response.data as any)?.data ?? response.data;
};

export const getOrder = async (orderId: number): Promise<Order> => {
  const response = await api.get<ApiResponse<Order>>(`${apiVersion}/orders/${orderId}`);
  return response.data.data;
};

export const cancelOrder = async (orderId: number): Promise<{ message: string }> => {
  const response = await api.delete(`${apiVersion}/orders/${orderId}`);
  return response.data;
};

export const getVendorOrders = async (): Promise<Order[]> => {
  const response = await api.get<ApiResponse<Order[]>>(`${apiVersion}/vendor/orders`);
  return (response.data as any)?.data ?? response.data;
};
export const confirmOrder = async (orderId: number): Promise<{ message: string }> => {
  const response = await api.patch(`${apiVersion}/vendor/orders/${orderId}/confirm`);
  return response.data;
}
export const rejectOrder = async (orderId: number): Promise<{ message: string }> => {
  const response = await api.patch(`${apiVersion}/vendor/orders/${orderId}/reject`);
  return response.data;
}