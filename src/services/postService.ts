import api from './api';
import { Post, ApiResponse } from '@/types';

export const postService = {
  /**
   * Data structure for creating a new post.
   */
  interface CreatePostData {
    content: string;
    images?: File[];
    productId?: string;
    shopId?: string;
  }
   * Fetches a list of posts from the backend API.
   * @returns A promise that resolves with an array of Post objects.
   */
  async getPosts(): Promise<Post[]> {
    const response = await api.get<ApiResponse<Post[]>>('/v1/posts');
    return response.data.data;
  },

  /**
 * Toggles the like status for a specific post.
 * @param postId The ID of the post to like or unlike.
 * @returns A promise that resolves with the updated like count.
 */
  async togglePostLike(postId: string): Promise<{ likes_count: number }> {
    const response = await api.post(`/v1/posts/${postId}/like`);
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

    const response = await api.post<ApiResponse<Post>>('/v1/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data;
  },
};