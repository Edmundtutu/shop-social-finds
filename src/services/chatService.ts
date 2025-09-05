import api from './api';
import type { ApiResponse } from '@/types/api';

const apiVersion = import.meta.env.VITE_API_VERSION;

export interface Conversation {
  id: number;
  order_id: string;
  user_id: string;
  shop_id: string;
  status: 'active' | 'archived';
  last_message_at: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  order?: any;
  user?: any;
  shop?: any;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  sender_type: 'user' | 'shop';
  content: string;
  message_type: 'text' | 'image' | 'audio';
  media_url?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender?: any;
}

export interface SendMessagePayload {
  conversation_id: number;
  content: string;
  message_type: 'text' | 'image' | 'audio';
  media_url?: string;
}

export interface GetConversationPayload {
  order_id: string;
}

// Get or create conversation for an order
export const getConversation = async (payload: GetConversationPayload): Promise<Conversation> => {
  const response = await api.post<ApiResponse<Conversation>>(`${apiVersion}/chat/conversation`, payload);
  return response.data.data;
};

// Send a message
export const sendMessage = async (payload: SendMessagePayload): Promise<Message> => {
  const response = await api.post<ApiResponse<Message>>(`${apiVersion}/chat/message`, payload);
  return response.data.data;
};

// Get conversation messages
export const getMessages = async (conversationId: number, page: number = 1): Promise<{ messages: Message[]; pagination: any }> => {
  const response = await api.get<ApiResponse<{ messages: Message[]; pagination: any }>>(
    `${apiVersion}/chat/conversations/${conversationId}/messages?page=${page}`
  );
  return response.data.data;
};

// Mark messages as read
export const markAsRead = async (conversationId: number): Promise<{ message: string }> => {
  const response = await api.patch<{ message: string }>(`${apiVersion}/chat/conversations/${conversationId}/read`);
  return response.data;
};

// Get user's conversations
export const getUserConversations = async (): Promise<Conversation[]> => {
  const response = await api.get<ApiResponse<Conversation[]>>(`${apiVersion}/chat/conversations/user`);
  return response.data.data;
};

// Get shop's conversations
export const getShopConversations = async (): Promise<Conversation[]> => {
  const response = await api.get<ApiResponse<Conversation[]>>(`${apiVersion}/chat/conversations/shop`);
  return response.data.data;
};

// Start typing indicator
export const startTyping = async (conversationId: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`${apiVersion}/chat/typing/start`, {
    conversation_id: conversationId,
  });
  return response.data;
};

// Stop typing indicator
export const stopTyping = async (conversationId: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`${apiVersion}/chat/typing/stop`, {
    conversation_id: conversationId,
  });
  return response.data;
};

// Update user presence
export const updatePresence = async (conversationId: number, status: 'online' | 'offline'): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`${apiVersion}/chat/presence`, {
    conversation_id: conversationId,
    status,
  });
  return response.data;
};
