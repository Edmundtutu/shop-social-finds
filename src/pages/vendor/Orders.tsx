import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const VendorOrders: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground">
            When customers place orders, they'll appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOrders;