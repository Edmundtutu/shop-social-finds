import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopMap from '@/components/features/ShopMap';
import { Shop } from '@/types';
import { DEMO_SHOPS } from '@/data/demoShops';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '@/services/shopService';
import { useGeolocation } from '@/hooks/utils/useGeolocation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Crosshair, X, Layers } from 'lucide-react'; // Import necessary icons
import { formatDistance } from '@/utils/location'; // Assuming formatDistance is needed for nearby list display in ShopMap

const ShopMapPage: React.FC = () => {
  const navigate = useNavigate();

  // Remove demo data states and effect
  /* useEffect(() => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setShops(DEMO_SHOPS);
      } catch (error) {
        console.error('Failed to load shops:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadShops();
  }, []); */

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // Based on SHOP_CATEGORIES values
  const [page, setPage] = useState(1);
  const [searchRadius, setSearchRadius] = useState(5); // Default radius in km

  const { location: userLocation, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  // Request location on component mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);


  const { data: shopsResponse, isLoading: shopsLoading, error: shopsError } = useQuery({
    queryKey: ['shops', userLocation, searchRadius, searchQuery, selectedCategory, page], // Query key includes dependencies
    queryFn: () => {
      // Only fetch if user location is available
      if (!userLocation) {
        // Returning a rejected promise or throwing an error prevents the query from succeeding
        return Promise.reject('User location not available');
      }
      return shopService.getShops({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: searchRadius,
        search: searchQuery,
        category: selectedCategory,
        page,
      });
    },
    enabled: !!userLocation, // Only enable query if user location is available
    keepPreviousData: true, // Keep previous data while fetching next page
    staleTime: 60 * 1000, // Data considered fresh for 1 minute
  });


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1); // Reset to first page on category change
  };

  const handleRadiusChange = (value: number[]) => {
    setSearchRadius(value[0]);
    setPage(1); // Reset to first page on radius change

  }, []);

  const handleShopSelect = (shop: Shop) => {
    // Navigate to shop page or show shop details
    navigate(`/shop/${shop.id}`);
  };

  const handlePreviousPage = () => {
    if (shopsResponse?.meta.current_page && shopsResponse.meta.current_page > 1) {
      setPage(shopsResponse.meta.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (shopsResponse?.meta.current_page && shopsResponse.meta.last_page && shopsResponse.meta.current_page < shopsResponse.meta.last_page) {
      setPage(shopsResponse.meta.current_page + 1);
    }
  };

  const isLoading = geoLoading || shopsLoading; // Combine loading states
  const error = geoError || shopsError; // Combine error states

  if (isLoading) {
    // Display loading spinner while geolocation is loading or shops are fetching
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shop Map</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find shops near you and discover their products
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 px-1 sm:px-0">
        <div className="flex gap-3 flex-col sm:flex-row">
          <form onSubmit={handleSearch} className="relative flex-1">
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
                onClick={requestLocation}
                disabled={geoLoading}
                className="h-8 w-8"
              >
                <Crosshair className={`h-4 w-4 ${geoLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </form>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {/* Keep SHOP_CATEGORIES array */}
            </SelectContent>
          </Select>
        </div>

        {/* Radius Slider */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Search Radius: {searchRadius} km
              </label>
              <Slider
                value={[searchRadius]}
                onValueChange={handleRadiusChange}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error.message || 'An error occurred'}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && ( // Show error if not loading
        <div className="text-center text-destructive py-12">Failed to load shops. Please try again later.</div>
      )}

      {/* Map Component */}
      {/* Only render ShopMap if not loading and no major error, and data is available */}
      {!isLoading && !error && shopsResponse?.data && (
        <ShopMap
          shops={shopsResponse.data} // Pass the fetched shop data
          onShopSelect={handleShopSelect}
          className="h-[60vh] sm:h-[70vh] lg:h-[600px]" // Set a fixed height for the map container
        />
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && shopsResponse?.meta && shopsResponse.meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button variant="outline" onClick={handlePreviousPage} disabled={shopsResponse.meta.current_page === 1}>Previous</Button>
          <span>Page {shopsResponse.meta.current_page} of {shopsResponse.meta.last_page}</span>
          <Button variant="outline" onClick={handleNextPage} disabled={shopsResponse.meta.current_page === shopsResponse.meta.last_page}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default ShopMapPage;