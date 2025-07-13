import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Star,
  MapPin,
  Camera,
  Plus,
  Package
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Discover amazing products from local shops and connect with fellow shoppers
        </p>
      </div>

      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          {!showCreatePost ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowCreatePost(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Share a product find or review...
            </Button>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind? Share a product find, review, or shopping experience..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Photos
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Tag Shop
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/discover">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Discover</h3>
              <p className="text-sm text-muted-foreground">Find products</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/map">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Map</h3>
              <p className="text-sm text-muted-foreground">Find shops</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/favorites">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Favorites</h3>
              <p className="text-sm text-muted-foreground">Saved items</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/cart">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Cart</h3>
              <p className="text-sm text-muted-foreground">0 items</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Start following other users and shops to see their posts in your feed
            </p>
            <Button asChild>
              <Link to="/discover">Discover Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {post.user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{post.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{post.content}</p>
                {post.product && (
                  <Link to={`/product/${post.product.id}`}>
                    <Card className="mb-4 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{post.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {post.product.shop.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm ml-1">
                                  {post.product.rating}
                                </span>
                              </div>
                              <span className="text-lg font-bold">
                                ${post.product.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post.id)}
                    className={post.liked_by_user ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${post.liked_by_user ? 'fill-current' : ''}`} />
                    {post.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {post.comments_count}
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