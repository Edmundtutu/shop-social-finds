import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import {
  Heart,
  MessageCircle,
  Share,
  Star,
  MapPin,
  Package,
  MoreHorizontal,
} from 'lucide-react';
import { postService } from '@/services/postService';
import { Post } from '@/types'; // Assuming Post type is in '@/types'

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get authenticated user (though not directly used in onMutate logic below)

  const likeMutation = useMutation({
    mutationFn: postService.togglePostLike, // The service function to call, receives postId
    onMutate: async (postId: string) => { // Optimistic update logic, receives the variable passed to mutate
      // Cancel any ongoing queries that could affect this update
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

      // Optimistically update the specific post in the cache
      if (previousPosts) {
        const newPosts = previousPosts.map(p => {
          if (p.id === postId) {
            const isLiked = p.liked_by_user;
            return {
              ...p,
              liked_by_user: !isLiked,
              likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
            };
          }
          return p;
        });
        queryClient.setQueryData(['posts'], newPosts);
      }

      // Return context object with the snapshotted value
      return { previousPosts };
    },
    onError: (error, postId, context) => { // Handle errors
      console.error('Like mutation failed:', error);
      // Rollback optimistic update on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      // Optionally show an error message (e.g., using a toast)
    },
    // onSuccess is not strictly needed here if optimistic update is sufficient
    // onSuccess: (data, postId, context) => { ... },
  });

  return (
    <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.user?.name.charAt(0)}
              </AvatarFallback>
              {/* Add AvatarImage if post.user.avatar is available */}
              {/* {post.user?.avatar && <AvatarImage src={post.user.avatar} />} */}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm lg:text-base truncate">{post.user?.name}</p>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()} • Public
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="mb-4 text-sm lg:text-base leading-relaxed">{post.content}</p>

        {/* Image Carousel */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <Carousel className="w-full max-w-full">
              <CarouselContent>
                {post.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square max-h-80">
                      <img
                        src={image}
                        alt={`Post Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      {/* Image counter */}
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {index + 1} / {post.images.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {post.images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>
        )}


        {post.product && (
          <Link to={`/product/${post.product.id}`}>
            <Card className="mb-4 hover:shadow-md transition-shadow border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {/* Placeholder Icon or Product Image if available */}
                     {post.product.images?.[0] ? (
                        <img
                          src={post.product.images[0]}
                          alt={post.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                         <Package className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm lg:text-base truncate">{post.product.name}</h4>
                    <p className="text-xs lg:text-sm text-muted-foreground truncate mb-2">
                      {post.product.shop?.name}
                    </p>
                    <div className="flex items-center gap-3">
                      {post.product.rating !== undefined && (
                         <div className="flex items-center">
                           <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                           <span className="text-sm ml-1">{post.product.rating}</span>
                         </div>
                      )}
                      {post.product.price !== undefined && (
                        <span className="text-lg font-bold text-primary">
                         UGX {post.product.price.toLocaleString()} {/* Assuming price is a number */}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate(post.id)} // Attach click handler
            className={`${post.liked_by_user ? 'text-red-500 hover:text-red-600' : ''} ${likeMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} // Add loading state visual
          >
            <Heart className={`h-4 w-4 mr-2 ${post.liked_by_user ? 'fill-current' : ''}`} />
            {post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}
          </Button>

          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.comments_count} {post.comments_count === 1 ? 'Comment' : 'Comments'}
          </Button>

          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostItem;