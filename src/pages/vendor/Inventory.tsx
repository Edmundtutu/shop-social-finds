import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Package } from 'lucide-react';
import { DynamicInventoryFlow } from '@/components/vendor/inventory/DynamicInventoryFlow';
import { useQuery } from '@tanstack/react-query';
import inventoryService from '@/services/inventoryService';
const VendorInventory: React.FC = () => {
  const { data: invetoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory(),
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-8">
          {invetoryData === null ? (
            <>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first product to start selling
              </p>
              <Button>Add Product</Button>
            </>
          ) : (
            <DynamicInventoryFlow />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorInventory;