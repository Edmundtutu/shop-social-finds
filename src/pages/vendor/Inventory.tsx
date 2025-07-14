import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Package } from 'lucide-react';

const VendorInventory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Inventory</h1>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6 md:p-8 text-center">
          <Package className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium mb-2">No products yet</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-md mx-auto">
            Add your first product to start selling
          </p>
          <Button className="w-full sm:w-auto">Add Product</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorInventory;