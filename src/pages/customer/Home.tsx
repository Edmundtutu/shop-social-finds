import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Star,
  MapPin,
  Camera,
  Plus,
  Package,
  TrendingUp,
  Users,
  Store,
  MoreHorizontal,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import PostItem from '@/components/PostItem'; // Import PostItem
import { postService } from '@/services/postService';
import { Post, Product } from '@/types';
import CameraCapture from '@/components/features/CameraCapture';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: postService.getPosts,
  });

  const handleCameraCapture = (imageData: string) => {
    setCapturedImages(prev => [...prev, imageData]);
    setShowCameraModal(false);
  };

  const handleCameraClose = () => {
    setShowCameraModal(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).slice(0, 4 - capturedImages.length).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCapturedImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };
  const handleCreatePost = () => {
    // TODO: Create post via API with images
    const postData = {
      content: newPostContent,
      images: capturedImages,
      hashtags: ['#InstaDaily', '#PhotoDump', '#LifeInTiles', '#CapturedMoments', '#EverydayVibes']
    };
    console.log('Creating post:', postData);
    
    setNewPostContent('');
    setCapturedImages([]);
    setShowCreatePost(false);
  };

  const handleLikePost = (postId: string) => {
    // TODO: Like/unlike post via API
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    setCapturedImages([]);
    setNewPostContent('');
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

      {/* Quick Stats - Facebook-style cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm lg:text-base">Trending</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">Hot deals</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Store className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm lg:text-base">Shops</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">Near you</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm lg:text-base">Community</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">Connect</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm lg:text-base">Favorites</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">0 items</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Post - Facebook-style */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          {!showCreatePost ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="flex-1 justify-start text-left h-10 bg-muted/50 hover:bg-muted"
                onClick={() => setShowCreatePost(true)}
              >
                <span className="text-muted-foreground text-xs lg:text-sm">Want to share your purchases?</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">Public</p>
                </div>
              </div>
              
              <Textarea
                placeholder="What did you find interesting today? Share a product find, review, or shopping experience..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] border-0 resize-none text-base placeholder:text-muted-foreground focus-visible:ring-0"
              />
              
              {/* Photo Carousel Preview */}
              {capturedImages.length > 0 && (
                <div className="my-4">
                  <Carousel className="w-full max-w-full">
                    <CarouselContent className="-ml-1">
                      {capturedImages.map((image, index) => (
                        <CarouselItem key={index} className="pl-1 basis-4/5 md:basis-3/5">
                          <div className="relative group">
                            <div className="relative aspect-square max-h-80">
                              <img 
                                src={image} 
                                alt={`Captured ${index + 1}`} 
                                className="w-full h-full object-cover rounded-lg border"
                                style={{
                                  aspectRatio: 'auto'
                                }}
                                onLoad={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  const container = img.parentElement;
                                  if (container) {
                                    const isLandscape = img.naturalWidth > img.naturalHeight;
                                    if (isLandscape) {
                                      container.style.aspectRatio = '4/3';
                                    } else {
                                      container.style.aspectRatio = '3/4';
                                    }
                                  }
                                }}
                              />
                              <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-destructive/80"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              
                              {/* Image counter */}
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                {index + 1} / {capturedImages.length}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {capturedImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                  </Carousel>
                  
                  {/* Suggested Hashtags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {['#InstaDaily', '#PhotoDump', '#LifeInTiles', '#CapturedMoments', '#EverydayVibes'].map(tag => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => setNewPostContent(prev => prev + ' ' + tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs lg:text-sm"
                    disabled={capturedImages.length >= 4}
                    onClick={() => setShowCameraModal(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Camera ({capturedImages.length}/4)
                  </Button>
                  
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={capturedImages.length >= 4}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs lg:text-sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={capturedImages.length >= 4}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload ({capturedImages.length}/4)
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-xs lg:text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Tag Shop
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCloseCreatePost}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleCreatePost} 
                    disabled={!newPostContent.trim() && capturedImages.length === 0}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-Page Camera Modal */}
      {showCameraModal && (
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
              <Button variant="outline" onClick={() => setShowCreatePost(true)}>
                Create Post
              </Button>
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