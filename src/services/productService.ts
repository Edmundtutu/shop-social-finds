import api from './api';
import { Product, PaginatedResponse, Review, ApiResponse } from '@/types';

interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number;
}

const apiVersion = import.meta.env.VITE_API_VERSION;

export const productService = {
  async getProducts(params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
    const formattedParams: any = {};

    if (params?.search) {
      const term = `%${params.search}%`;
      formattedParams['name[like]'] = term;
      formattedParams['description[like]'] = term;
      formattedParams['tags[like]'] = term;
    }

    if (params?.category && params.category !== 'All') {
      formattedParams['category[eq]'] = params.category;
    }

    if (params?.page) {
      formattedParams['page'] = params.page;
    }

    const response = await api.get(`${apiVersion}/products`, { params: formattedParams });
    const payload = response.data;
    if (payload && payload.meta) {
      return {
        data: payload.data ?? [],
        current_page: payload.meta.current_page ?? 1,
        last_page: payload.meta.last_page ?? 1,
        per_page: payload.meta.per_page ?? (payload.data?.length ?? 0),
        total: payload.meta.total ?? (payload.data?.length ?? 0),
      };
    }
    // Fallback for non-paginated arrays
    return {
      data: payload?.data ?? [],
      current_page: 1,
      last_page: 1,
      per_page: payload?.data?.length ?? 0,
      total: payload?.data?.length ?? 0,
    };
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`${apiVersion}/products/${id}`);
    // Most of our services unwrap .data
    return (response.data as any).data ?? (response.data as any);
  },

  async attachCategories(productId: string, categoryIds: string[]): Promise<Product> {
    const response = await api.put<ApiResponse<Product>>(`${apiVersion}/products/${productId}`, {
      category_ids: categoryIds,
    });
    return (response.data as any).data ?? (response.data as any);
  },

  async getProductReviews(productId: string): Promise<Review[]> {
    const response = await api.get(`${apiVersion}/reviews`, {
      params: { product_id: productId },
    });
    // Paginator shape
    if ((response.data as any)?.data) {
      return (response.data as any).data;
    }
    return response.data ?? [];
  },
};