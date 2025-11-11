import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
  className?: string;
  showShop?: boolean;
  showRating?: boolean;
  showFavoriteButton?: boolean;
  showAddButton?: boolean;
  onRemoveFavorite?: (productId: string) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  showShop = true,
  showRating = true,
  showFavoriteButton = true,
  showAddButton = true,
  onRemoveFavorite,
}) => {
  const { isProductFavorited, toggleProductFavorite } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const wasFavorited = isProductFavorited(product.id);
    toggleProductFavorite(product);
    toast({
      title: wasFavorited ? 'Removed from favorites' : 'Added to favorites',
      description: wasFavorited ? 'Dish removed from your favorites' : 'Dish added to your favorites',
    });
  };


  return (
    <Card className={`group hover:shadow-lg transition-shadow ${className ?? ''}`}>
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="text-2xl md:text-4xl text-muted-foreground">📦</div>
            )}
          </div>
          {showFavoriteButton && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 bg-white/80 hover:bg-white h-6 w-6 md:h-8 md:w-8 xl:h-7 xl:w-7 ${
                isProductFavorited(product.id) ? 'text-red-500' : ''
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart
                className={`h-3 w-3 md:h-4 md:w-4 xl:h-3 xl:w-3 ${
                  isProductFavorited(product.id) ? 'fill-current' : ''
                }`}
              />
            </Button>
          )}
        </div>

        <div className="p-3 md:p-4 xl:p-3">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-sm md:text-base xl:text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
              {product.name}
            </h3>
          </Link>

          {showShop && (
            <div className="flex items-center gap-1 md:gap-2 xl:gap-1 mb-2">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 xl:h-3 xl:w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs md:text-sm xl:text-xs text-muted-foreground truncate">
                {product.shop?.name}
              </span>
            </div>
          )}

          {showRating && (
            <div className="flex items-center gap-1 md:gap-2 xl:gap-1 mb-2 md:mb-3 xl:mb-2">
              <div className="flex items-center">
                <Star className="h-3 w-3 md:h-4 md:w-4 xl:h-3 xl:w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs md:text-sm xl:text-xs ml-1">{product.rating}</span>
                <span className="text-xs text-muted-foreground ml-1 hidden md:inline xl:hidden">
                  ({product.total_reviews})
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm md:text-lg xl:text-sm font-bold">UGX {product.price.toLocaleString()}</span>
            {onRemoveFavorite && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={(e) => {
                  e.preventDefault();
                  onRemoveFavorite(product.id);
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;


