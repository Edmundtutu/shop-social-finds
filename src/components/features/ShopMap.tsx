import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  MapPin, 
  Navigation,
  Crosshair,
  Filter,
  X
} from 'lucide-react';
import { Shop } from '@/types';
import { useGeolocation } from '@/hooks/utils/useGeolocation';
import { getShopsWithinRadius, formatDistance, reverseGeocode } from '@/utils/location';
import ShopMarker from './ShopMarker';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ShopMapProps {
  shops: Shop[];
  onShopSelect?: (shop: Shop) => void;
  onLocationTag?: (location: { lat: number; lng: number; address: string }) => void;
  showTagging?: boolean;
  className?: string;
}

interface LocationTaggingProps {
  onLocationTag: (location: { lat: number; lng: number; address: string }) => void;
}

const LocationTagger: React.FC<LocationTaggingProps> = ({ onLocationTag }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingAddress, setIsGettingAddress] = useState(false);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });
      setIsGettingAddress(true);
      
      try {
        const address = await reverseGeocode({ lat, lng });
        onLocationTag({ lat, lng, address });
      } catch (error) {
        console.error('Failed to get address:', error);
        onLocationTag({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      } finally {
        setIsGettingAddress(false);
      }
    },
  });

  if (!selectedLocation) return null;

  return (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
      <Popup>
        <div className="text-center p-2">
          {isGettingAddress ? (
            <p className="text-sm">Getting address...</p>
          ) : (
            <p className="text-sm">Location selected!</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const ShopMap: React.FC<ShopMapProps> = ({ 
  shops, 
  onShopSelect, 
  onLocationTag,
  showTagging = false,
  className = ""
}) => {
  const { location: userLocation, error, loading, requestLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState([5]); // km
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // Default center (Your current location)
  const defaultCenter: [number, number] = [-1.268122, 29.985997];
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  // Filter shops based on search and radius
  const filteredShops = useMemo(() => {
    let filtered = shops;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by radius if user location is available
    if (userLocation) {
      filtered = getShopsWithinRadius(userLocation, filtered, searchRadius[0]);
    }

    return filtered;
  }, [shops, searchQuery, searchRadius, userLocation]);

  useEffect(() => {
    // Request location on component mount
    requestLocation();
  }, [requestLocation]);

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    onShopSelect?.(shop);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useMemo above
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={requestLocation}
              disabled={loading}
              className="h-8 w-8"
            >
              <Crosshair className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </form>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search Radius: {searchRadius[0]} km
                </label>
                <Slider
                  value={searchRadius}
                  onValueChange={setSearchRadius}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {filteredShops.length} shops found
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Status */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[60vh] sm:h-[70vh] lg:h-[600px]">
        <div className="lg:col-span-2 h-full">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="h-full rounded-lg overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* User location marker */}
                  {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                      <Popup>
                        <div className="text-center p-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <Navigation className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-sm font-medium">Your location</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  
                  {/* Shop markers */}
                  {filteredShops.map((shop) => (
                    <ShopMarker
                      key={shop.id}
                      shop={shop}
                      onShopSelect={handleShopSelect}
                    />
                  ))}

                  {/* Location tagging */}
                  {showTagging && onLocationTag && (
                    <LocationTagger onLocationTag={onLocationTag} />
                  )}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shop Details Sidebar */}
        <div className="space-y-4">
          {selectedShop ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    {selectedShop.avatar ? (
                      <img 
                        src={selectedShop.avatar} 
                        alt={selectedShop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {selectedShop.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedShop.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedShop.verified ? 'default' : 'secondary'}>
                        {selectedShop.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedShop.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedShop.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedShop.location.address}</span>
                  </div>
                  
                  {userLocation && (
                    <div className="text-sm text-primary font-medium">
                      {formatDistance(
                        Math.sqrt(
                          Math.pow(selectedShop.location.lat - userLocation.lat, 2) +
                          Math.pow(selectedShop.location.lng - userLocation.lng, 2)
                        ) * 111 // Rough conversion to km
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => onShopSelect?.(selectedShop)}
                  >
                    View Products
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedShop.location.lat},${selectedShop.location.lng}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a shop</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a marker to view shop details
                </p>
              </CardContent>
            </Card>
          )}

          {/* Nearby Shops List */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">
                Nearby Shops ({filteredShops.length})
              </h3>
              {filteredShops.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No shops found in your area
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredShops.slice(0, 10).map((shop) => (
                    <div
                      key={shop.id}
                      className={`flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                        selectedShop?.id === shop.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleShopSelect(shop)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {shop.avatar ? (
                          <img 
                            src={shop.avatar} 
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {shop.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{shop.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            ⭐ {shop.rating}
                          </span>
                          {userLocation && 'distance' in shop && (
                            <span className="text-xs text-primary">
                              {formatDistance(shop.distance as number)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showTagging && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <MapPin className="h-4 w-4 inline mr-2" />
          Click anywhere on the map to tag a location for your post
        </div>
      )}
    </div>
  );
};

export default ShopMap;