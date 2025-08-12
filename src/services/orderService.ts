import api from './api';
import { CreateOrderPayload, Order } from '@/types/orders';

export const createOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
  const response = await api.post('/orders', orderData);
  return response.data.data;
};

export const getOrders = async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data.data;
};

export const getOrder = async (orderId: number): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
};

export const cancelOrder = async (orderId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
};

export const getVendorOrders = async (): Promise<Order[]> => {
    const response = await api.get('/vendor/orders');
    return response.data.data;
};
