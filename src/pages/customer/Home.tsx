import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Post, Product } from '@/types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading posts
    setIsLoading(false);
    // TODO: Fetch actual posts from API
    setPosts([]);
  }, []);

  const handleCreatePost = () => {
    // TODO: Create post via API
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const handleLikePost = (postId: string) => {
    // TODO: Like/unlike post via API
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
                <span className="text-muted-foreground">What's on your mind, {user?.name}?</span>
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
                placeholder="What's on your mind? Share a product find, review, or shopping experience..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] border-0 resize-none text-base placeholder:text-muted-foreground focus-visible:ring-0"
              />
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs lg:text-sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Photo
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
                    onClick={() => setShowCreatePost(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleCreatePost} 
                    disabled={!newPostContent.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed */}
      {posts.length === 0 ? (
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
          {posts.map((post) => (
            <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {post.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm lg:text-base truncate">{post.user.name}</p>
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
                
                {post.product && (
                  <Link to={`/product/${post.product.id}`}>
                    <Card className="mb-4 hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm lg:text-base truncate">{post.product.name}</h4>
                            <p className="text-xs lg:text-sm text-muted-foreground truncate mb-2">
                              {post.product.shop.name}
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm ml-1">{post.product.rating}</span>
                              </div>
                              <span className="text-lg font-bold text-primary">
                                ${post.product.price}
                              </span>
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
                    onClick={() => handleLikePost(post.id)}
                    className={`${post.liked_by_user ? 'text-red-500 hover:text-red-600' : ''}`}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;