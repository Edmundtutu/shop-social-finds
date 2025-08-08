import api from './api';
import { Post, ApiResponse } from '@/types';

/**
 * Data structure for creating a new post.
 */
interface CreatePostData {
  content: string;
  images?: File[];
  productId?: string;
  shopId?: string;
}

const apiVersion = import.meta.env.VITE_API_VERSION;

export const postService = {
  /**
   * Fetches a list of posts from the backend API.
   * @returns A promise that resolves with an array of Post objects.
   */
  async getPosts(): Promise<Post[]> {
    const response = await api.get<ApiResponse<Post[]>>(`${apiVersion}/posts`);
    return response.data.data;
  },

  /**
   * Toggles the like status for a specific post.
   * @param postId The ID of the post to like or unlike.
   * @returns A promise that resolves with the updated like count.
   */
  async togglePostLike(postId: string): Promise<{ likes_count: number }> {
    const response = await api.post(`${apiVersion}/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Creates a new post.
   * @param postData The data for the new post, including content and optional images, product, and shop.
   * @returns A promise that resolves with the newly created Post object.
   */
  async createPost(postData: CreatePostData): Promise<Post> {
    const formData = new FormData();
    formData.append('content', postData.content);

    if (postData.images) {
      postData.images.forEach(image => {
        formData.append('images[]', image);
      });
    }

    if (postData.productId) {
      formData.append('product_id', postData.productId);
    }

    if (postData.shopId) {
      formData.append('shop_id', postData.shopId);
    }

    const response = await api.post<ApiResponse<Post>>('${apiVersion}/posts', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    return response.data.data;
  },
};