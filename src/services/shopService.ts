import api from './api';
import { Shop, Product, Order, Review, Post, PaginatedResponse, ApiResponse } from '@/types';

const apiVersion = import.meta.env.VITE_API_VERSION;

export const shopService = {
  // Shops
  async getShops(params?: {
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<Shop[]> {
    const response = await api.get<ApiResponse<Shop[]>>(`${apiVersion}/shops`, { params });
    return response.data.data;
  },

  async getShop(id: number): Promise<Shop> {
    const response = await api.get<ApiResponse<Shop>>(`${apiVersion}/shops/${id}`);
    return response.data.data;
  },

  async createShop(data: Partial<Shop>): Promise<Shop> {
    const response = await api.post<ApiResponse<Shop>>(`${apiVersion}/shops`, data);
    return response.data.data;
  },

  async updateShop(id: number, data: Partial<Shop>): Promise<Shop> {
    const response = await api.put<ApiResponse<Shop>>(`${apiVersion}/shops/${id}`, data);
    return response.data.data;
  },

  async deleteShop(id: number): Promise<void> {
    await api.delete(`${apiVersion}/shops/${id}`);
  },

  // Products
  async getProducts(params?: {
    search?: string;
    category?: string;
    shop_id?: number;
    lat?: number;
    lng?: number;
    radius?: number;
    page?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>(`${apiVersion}/products`, { params });
    return response.data;
  },

  async getProduct(id: number): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`${apiVersion}/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await api.post<ApiResponse<Product>>(`${apiVersion}/products`, data);
    return response.data.data;
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await api.put<ApiResponse<Product>>(`${apiVersion}/products/${id}`, data);
    return response.data.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`${apiVersion}/products/${id}`);
  },

  async getShopProducts(shopId: number): Promise<Product[]> {
    const response = await api.get(`${apiVersion}/products`, { params: { shop_id: shopId } });
    // Accept either paginated or plain data
    if ((response.data as any)?.data) {
      return (response.data as any).data;
    }
    return response.data ?? [];
  },

  // Orders
  async getOrders(params?: {
    status?: string;
    shop_id?: number;
    page?: number;
  }): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`${apiVersion}/orders`, { params });
    return response.data;
  },

  async getOrder(id: number): Promise<Order> {
    const response = await api.get<ApiResponse<Order>>(`${apiVersion}/orders/${id}`);
    return response.data.data;
  },

  async createOrder(data: {
    shop_id: number;
    items: { product_id: number; quantity: number }[];
    delivery_type: 'pickup' | 'delivery';
    delivery_address?: string;
    notes?: string;
  }): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(`${apiVersion}/orders`, data);
    return response.data.data;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await api.put<ApiResponse<Order>>(`${apiVersion}/orders/${id}/status`, { status });
    return response.data.data;
  },

  // Reviews
  async getReviews(params?: {
    product_id?: number;
    shop_id?: number;
    page?: number;
  }): Promise<PaginatedResponse<Review>> {
    const response = await api.get<PaginatedResponse<Review>>(`${apiVersion}/reviews`, { params });
    return response.data;
  },

  async createReview(data: {
    product_id?: number;
    shop_id?: number;
    rating: number;
    comment?: string;
    images?: string[];
  }): Promise<Review> {
    const response = await api.post<ApiResponse<Review>>(`${apiVersion}/reviews`, data);
    return response.data.data;
  },

  // Posts (Social Feed)
  async getPosts(params?: { page?: number }): Promise<PaginatedResponse<Post>> {
    const response = await api.get<PaginatedResponse<Post>>(`${apiVersion}/posts`, { params });
    return response.data;
  },

  async createPost(data: {
    content: string;
    images?: string[];
    product_id?: number;
    shop_id?: number;
  }): Promise<Post> {
    const response = await api.post<ApiResponse<Post>>(`${apiVersion}/posts`, data);
    return response.data.data;
  },

  async likePost(id: number): Promise<void> {
    await api.post(`${apiVersion}/posts/${id}/like`);
  },

  async unlikePost(id: number): Promise<void> {
    await api.delete(`${apiVersion}/posts/${id}/like`);
  },

  // Cart
  async getCart(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`${apiVersion}/cart`);
    return response.data.data;
  },

  async addToCart(product_id: number, quantity: number): Promise<void> {
    await api.post(`${apiVersion}/cart`, { product_id, quantity });
  },

  async updateCartItem(id: number, quantity: number): Promise<void> {
    await api.put(`${apiVersion}/cart/${id}`, { quantity });
  },

  async removeFromCart(id: number): Promise<void> {
    await api.delete(`${apiVersion}/cart/${id}`);
  },

  async clearCart(): Promise<void> {
    await api.delete(`${apiVersion}/cart`);
  },
};