import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import PostItem from '@/components/PostItem';
import { postService } from '@/services/postService';
import QuickStatsGrid from '@/components/customer/home/QuickStatsGrid';
import CameraCapture from '@/components/features/CameraCapture';
import { useImageCapture } from '@/hooks/useImageCapture';
import { MessageCircle } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const imageCapture = useImageCapture();

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: postService.getPosts,
  });

  const handleCameraCapture = (imageData: string) => imageCapture.handleCameraCapture(imageData);
  const handleCameraClose = () => imageCapture.handleCameraClose();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching posts:", error);
    return (
      <div className="text-center text-destructive py-12">Failed to load posts. Please try again later.</div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Header - Facebook-style */}
      <div className="text-center py-4 lg:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Discover amazing products from local shops
        </p>
      </div>

      <QuickStatsGrid />

      {/* Post creation removed per new requirement: must be initiated from Orders */}

      {/* Full-Page Camera Modal */}
      {imageCapture.showCameraModal && (
        <div className="fixed inset-0 z-50 bg-background">
          <CameraCapture 
            onCapture={handleCameraCapture}
            onClose={handleCameraClose}
          />
        </div>
      )}

      {/* Feed */}
      {/* Use postsData directly from useQuery */}
      {!postsData || postsData.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-8 lg:p-12 text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6 text-sm lg:text-base max-w-md mx-auto">
              Start following other users and shops to see their posts in your feed, or create your first post!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/discover">Discover Products</Link>
              </Button>
              {/* Creation moved to Orders tab; remove CTA from Home */}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {postsData.map((post) => ( // Use postsData here
            <PostItem key={post.id} post={post} /> // Use PostItem component
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;