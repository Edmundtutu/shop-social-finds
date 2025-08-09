import api from './api';
import { Product, ApiResponse } from '@/types';

interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number;
}

export const productService = {
  async getProducts(params?: GetProductsParams): Promise<ApiResponse<Product[]>> {
    const formattedParams: any = {};

    if (params?.search) {
      formattedParams['name[like]'] = params.search;
      formattedParams['description[like]'] = params.search;
      formattedParams['tags[like]'] = params.search;
    }

    if (params?.category && params.category !== 'All') {
      formattedParams['category[eq]'] = params.category;
    }

    if (params?.page) {
      formattedParams['page'] = params.page;
    }

    const response = await api.get<ApiResponse<Product[]>>('/v1/products', { params: formattedParams });
    return response.data;
  },
};