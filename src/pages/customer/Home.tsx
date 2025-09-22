import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import PostItem from '@/components/customer/home/PostItem';
import { postService } from '@/services/postService';
import QuickStatsGrid from '@/components/customer/home/QuickStatsGrid';
import CameraCapture from '@/components/features/CameraCapture';
import { useImageCapture } from '@/hooks/useImageCapture';
import { MessageCircle } from 'lucide-react';
import { TextCarousel } from '@/components/features/TextCarousel';
import StoriesCarousel from '@/components/features/StoriesCarousel';
import { storyService } from '@/services/storyService';
import { toast } from 'sonner';

const Home: React.FC = () => {
  const { user } = useAuth();
  const imageCapture = useImageCapture();

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: postService.getPosts,
  });

  const { data: storiesData, isLoading: storiesLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: storyService.getActiveStories,
  });

  const handleCameraCapture = (imageData: string) => imageCapture.handleCameraCapture(imageData);
  const handleCameraClose = () => imageCapture.handleCameraClose();

  const handleStoryReaction = (storyId: string, emoji: string) => {
    toast.success(`Reacted to story with ${emoji}`);
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <TextCarousel
              className="flex-1 text-muted-foreground text-sm"
              texts={[
                'Share your shopping experience',
                'Nearby Restaurants Have nice food!! Read the Post',
                'What is your location today',
                'Where will you go for shopping',
                'Join your friends for a bite',
                'Pictures of your purchase will guide a friend',
                'Enjoy your experience with friends',
              ]}
              interval={4000}
              transitionDuration={300}
            />
          </div>
        </div>
        <div className="border-b border-gray-200"></div>
        <QuickStatsGrid />
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Stories Carousel */}
        {!storiesLoading && storiesData && storiesData.length > 0 && (
          <StoriesCarousel stories={storiesData} onReaction={handleStoryReaction} />
        )}

        {/* Feed */}
        {!postsData || postsData.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                Start following others to see their posts, or create your first post!
              </p>
              <Button asChild>
                <Link to="/discover">Discover Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {postsData.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Full-Page Camera Modal */}
      {imageCapture.showCameraModal && (
        <div className="fixed inset-0 z-50 bg-background">
          <CameraCapture onCapture={handleCameraCapture} onClose={handleCameraClose} />
        </div>
      )}
    </div>
  );
};

export default Home;