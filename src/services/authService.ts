import api from './api';
import { User, ApiResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'customer' | 'vendor';
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/login', { email, password });
    return response.data.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/register', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async me(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/user');
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/forgot-password', { email });
  },

  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await api.post('/reset-password', data);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/user/profile', data);
    return response.data.data;
  },

  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await api.put('/user/password', data);
  },
};