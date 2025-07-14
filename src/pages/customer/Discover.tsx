import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Star,
  MapPin,
  Heart,
  ShoppingCart,
  SlidersHorizontal
} from 'lucide-react';
import { Product } from '@/types';

const Discover: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Food & Drink',
    'Beauty',
    'Toys',
    'Automotive'
  ];

  useEffect(() => {
    // Simulate loading products
    setIsLoading(false);
    // TODO: Fetch actual products from API based on search and filters
    setProducts([]);
  }, [searchQuery, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Add to cart via API
  };

  const handleToggleFavorite = (productId: string) => {
    // TODO: Toggle favorite via API
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6 px-1 sm:px-0">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover Products</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Find amazing products from local shops near you
        </p>
      </div>

      {/* Search Bar - Mobile optimized */}
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          <Input
            placeholder="Search for products, brands, or shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 md:pl-12 h-10 md:h-12 text-sm md:text-base"
          />
        </div>
      </form>

      {/* Categories - Horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap text-xs md:text-sm flex-shrink-0"
            onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Filters and Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs md:text-sm text-muted-foreground">
          {products.length} products found
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="text-xs md:text-sm"
        >
          <SlidersHorizontal className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Filters
        </Button>
      </div>

      {/* Products Grid - Responsive */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Try adjusting your search terms or browse different categories
            </p>
            <Button onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                    <div className="text-2xl md:text-4xl text-muted-foreground">📦</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white h-6 w-6 md:h-8 md:w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleFavorite(product.id);
                    }}
                  >
                    <Heart className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
                
                <div className="p-3 md:p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 md:gap-2 mb-2">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs md:text-sm text-muted-foreground truncate">
                      {product.shop.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs md:text-sm ml-1">{product.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1 hidden md:inline">
                        ({product.total_reviews})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm md:text-lg font-bold">${product.price}</span>
                    <Button
                      size="sm"
                      className="h-6 md:h-8 px-2 md:px-3 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product.id);
                      }}
                    >
                      <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden md:inline">Add</span>
                    </Button>
                  </div>
                  
                  {product.stock < 5 && product.stock > 0 && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Only {product.stock} left
                    </Badge>
                  )}
                  
                  {product.stock === 0 && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Out of stock
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Discover;