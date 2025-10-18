import api from './api';
import type { ApiResponse } from '@/types/api';

const apiVersion = import.meta.env.VITE_API_VERSION;

export interface MomoInitiateRequest {
  vendor_id: string;
  payer_number: string;
  amount: number;
  currency?: string;
  order_id?: string;
  external_id?: string;
}

export interface MomoInitiateResponse {
  reference_id: string;
  status: 'pending';
}

export interface MomoStatusResponse {
  reference_id: string;
  status: 'pending' | 'successful' | 'failed';
  reason?: string;
  raw?: any;
}

export const initiateMomoPayment = async (data: MomoInitiateRequest): Promise<MomoInitiateResponse> => {
  const response = await api.post<ApiResponse<MomoInitiateResponse>>(`${apiVersion}/momo/initiate`, data);
  return response.data.data;
};

export const checkMomoStatus = async (referenceId: string): Promise<MomoStatusResponse> => {
  try {
    const response = await api.get<ApiResponse<MomoStatusResponse>>(`${apiVersion}/momo/status/${referenceId}`);
    
    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data as unknown as MomoStatusResponse;
    } else {
      throw new Error('Invalid response structure from MoMo status endpoint');
    }
  } catch (error) {
    console.error('Error fetching MoMo status:', error);
    // Return a default response structure for error cases
    return {
      reference_id: referenceId,
      status: 'pending',
      reason: 'Unable to fetch status',
      raw: { error: error }
    };
  }
};

export const createOrderWithMomoPayment = async (orderData: any): Promise<any> => {
  // This will be similar to createOrderWithPayment but for MoMo
  // We'll create the order first, then initiate MoMo payment
  const response = await api.post<ApiResponse<any>>(`${apiVersion}/orders/with-payment`, {
    ...orderData,
    payment_method: 'mtn_momo_collection'
  });
  
  if (response.data.data) {
    return response.data.data;
  }
  
  return response.data as unknown as any;
};
