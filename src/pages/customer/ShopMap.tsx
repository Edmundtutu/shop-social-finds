import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star,
  Navigation,
  Phone,
  Clock
} from 'lucide-react';
import { Shop } from '@/types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ShopMap: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Default center (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  const mapCenter = userLocation || defaultCenter;

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // TODO: Fetch shops from API
    setIsLoading(false);
    setShops([]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Search shops by query
  };

  const handleDirections = (shop: Shop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.location.lat},${shop.location.lng}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Shop Map</h1>
        <p className="text-muted-foreground">
          Find shops near you and discover their products
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="h-full rounded-lg overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* User location marker */}
                  {userLocation && (
                    <Marker position={userLocation}>
                      <Popup>Your location</Popup>
                    </Marker>
                  )}
                  
                  {/* Shop markers */}
                  {shops.map((shop) => (
                    <Marker
                      key={shop.id}
                      position={[shop.location.lat, shop.location.lng]}
                      eventHandlers={{
                        click: () => setSelectedShop(shop),
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-medium">{shop.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{shop.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({shop.total_reviews})
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {shop.location.address}
                          </p>
                          <Button
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => setSelectedShop(shop)}
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shop Details */}
        <div className="space-y-4">
          {selectedShop ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedShop.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedShop.rating}</span>
                      <span className="text-muted-foreground">
                        ({selectedShop.total_reviews} reviews)
                      </span>
                    </div>
                    {selectedShop.verified && (
                      <Badge variant="default">Verified</Badge>
                    )}
                  </div>
                </div>

                {selectedShop.description && (
                  <p className="text-muted-foreground">{selectedShop.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span className="text-sm">{selectedShop.location.address}</span>
                  </div>
                  
                  {selectedShop.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${selectedShop.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedShop.phone}
                      </a>
                    </div>
                  )}
                  
                  {selectedShop.hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm">
                        {/* TODO: Display current day hours or "View hours" */}
                        <span className="text-primary cursor-pointer hover:underline">
                          View hours
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleDirections(selectedShop)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Products
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
                  Click on a marker on the map to view shop details
                </p>
              </CardContent>
            </Card>
          )}

          {/* Nearby Shops List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Nearby Shops</h3>
              {shops.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No shops found in your area
                </p>
              ) : (
                <div className="space-y-3">
                  {shops.slice(0, 5).map((shop) => (
                    <div
                      key={shop.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedShop(shop)}
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{shop.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{shop.rating}</span>
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
    </div>
  );
};

export default ShopMap;