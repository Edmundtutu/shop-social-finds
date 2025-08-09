import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopMap from '@/components/features/ShopMap';
import { Shop } from '@/types';
import { DEMO_SHOPS } from '@/data/demoShops';

const ShopMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading shops from API
    const loadShops = async () => {
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
  }, []);

  const handleShopSelect = (shop: Shop) => {
    // Navigate to shop page or show shop details
    navigate(`/shop/${shop.id}`);
  };

  if (isLoading) {
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

      {/* Map Component */}
      <ShopMap
        shops={shops}
        onShopSelect={handleShopSelect}
        className=""
      />
    </div>
  );
};

export default ShopMapPage;