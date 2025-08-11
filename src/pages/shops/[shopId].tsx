import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '@/services/shopService';
import { Product, Shop } from '@/types';

const ShopDetails: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const { data: shop, isLoading: loadingShop, error: shopError } = useQuery<Shop>({
    enabled: !!shopId,
    queryKey: ['shop', shopId],
    queryFn: () => shopService.getShop(shopId as string),
    staleTime: 30_000,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    enabled: !!shopId,
    queryKey: ['shopProducts', shopId],
    queryFn: async () => {
      const response = await shopService.getShopProducts(shopId as string);
      return response;
    },
    staleTime: 30_000,
  });

  if (loadingShop) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Shop Not Found</h2>
        {shopError && (
          <p className="text-sm text-destructive mb-2">{(shopError as Error).message}</p>
        )}
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      {/* Shop Profile */}
      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row items-center gap-6 p-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {shop.avatar ? (
              <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl">
                {shop.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">{shop.name}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-base font-medium">{shop.rating}</span>
                <span className="text-xs text-muted-foreground">({shop.total_reviews})</span>
              </div>
              <Badge variant={shop.verified ? 'default' : 'secondary'} className="text-xs">
                {shop.verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 items-center md:items-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{shop.location.address}</span>
              </div>
              {shop.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${shop.phone}`} className="hover:underline text-primary">{shop.phone}</a>
                </div>
              )}
            </div>
            {shop.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{shop.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Products List */}
      <h3 className="text-xl font-semibold mb-4">Products</h3>
      {loadingProducts ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(products as Product[] | undefined)?.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">No products found for this shop.</div>
        ) : (
          (products as Product[] | undefined)?.map((product) => (
            <Card key={product.id} className="h-full flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="w-full h-40 bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">{product.name.charAt(0)}</span>
                  )}
                </div>
                <h4 className="font-semibold text-lg mb-1 truncate">{product.name}</h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-primary font-bold text-base">UGX {product.price.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      )}
    </div>
  );
};

export default ShopDetails; 