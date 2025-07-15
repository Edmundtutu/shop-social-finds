import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Navigation2 } from 'lucide-react';
import { Shop } from '@/types';
import { formatDistance } from '@/utils/location';
import L from 'leaflet';

interface ShopMarkerProps {
  shop: Shop & { distance?: number };
  onShopSelect?: (shop: Shop) => void;
}

const ShopMarker: React.FC<ShopMarkerProps> = ({ shop, onShopSelect }) => {
  // Create custom marker icon with shop avatar
  const createCustomIcon = (avatarUrl?: string) => {
    const iconHtml = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid #3b82f6;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        overflow: hidden;
      ">
        ${avatarUrl 
          ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
          : `<div style="width: 100%; height: 100%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${shop.name.charAt(0)}</div>`
        }
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-shop-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  return (
    <Marker
      position={[shop.location.lat, shop.location.lng]}
      icon={createCustomIcon(shop.avatar)}
      eventHandlers={{
        click: () => onShopSelect?.(shop),
      }}
    >
      <Popup className="shop-popup" maxWidth={320} closeButton={false}>
        <div className="p-3 min-w-[300px]">
          {/* Shop Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary/20">
              {shop.avatar ? (
                <img 
                  src={shop.avatar} 
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {shop.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground truncate">{shop.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{shop.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({shop.total_reviews} reviews)
                  </span>
                </div>
                {shop.verified && (
                  <Badge variant="default" className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Business Category */}
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {shop.description?.split(' ')[0] || 'Business'}
            </Badge>
          </div>

          {/* Shop Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-foreground block">
                  {shop.location.address}
                </span>
                {shop.distance !== undefined && (
                  <span className="text-xs text-primary font-medium">
                    {formatDistance(shop.distance)} away
                  </span>
                )}
              </div>
            </div>

            {shop.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a 
                  href={`tel:${shop.phone}`}
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {shop.phone}
                  <span className="text-xs text-muted-foreground">(tap to call)</span>
                </a>
              </div>
            )}

            {shop.description && (
              <div className="bg-muted/50 p-2 rounded-md">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {shop.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button 
              size="sm" 
              className="flex items-center gap-2 h-9"
              onClick={(e) => {
                e.stopPropagation();
                onShopSelect?.(shop);
              }}
            >
              <span className="text-xs font-medium">View Shop</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 h-9"
              onClick={(e) => {
                e.stopPropagation();
                const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.location.lat},${shop.location.lng}&travelmode=driving`;
                window.open(url, '_blank');
              }}
            >
              <Navigation2 className="h-3 w-3" />
              <span className="text-xs font-medium">Directions</span>
            </Button>
          </div>
          
          {/* Quick Actions */}
          {shop.phone && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${shop.phone}`, '_self');
                }}
              >
                <Phone className="h-3 w-3 mr-1" />
                Call Now
              </Button>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default ShopMarker;