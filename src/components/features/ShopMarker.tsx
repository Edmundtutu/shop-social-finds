import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Clock } from 'lucide-react';
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
      <Popup className="shop-popup" maxWidth={300}>
        <div className="p-2 min-w-[250px]">
          {/* Shop Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {shop.avatar ? (
                <img 
                  src={shop.avatar} 
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {shop.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{shop.name}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{shop.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({shop.total_reviews})
                  </span>
                </div>
                {shop.verified && (
                  <Badge variant="default" className="text-xs px-1 py-0">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Shop Details */}
          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {shop.location.address}
              </span>
            </div>
            
            {shop.distance !== undefined && (
              <div className="text-sm text-primary font-medium">
                {formatDistance(shop.distance)}
              </div>
            )}

            {shop.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${shop.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {shop.phone}
                </a>
              </div>
            )}

            {shop.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {shop.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onShopSelect?.(shop)}
            >
              View Shop
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.location.lat},${shop.location.lng}`;
                window.open(url, '_blank');
              }}
            >
              Directions
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default ShopMarker;