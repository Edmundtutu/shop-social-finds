import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Store } from 'lucide-react';

const VendorProfile: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Shop Profile</h1>
      
      <Card>
        <CardContent className="p-6 md:p-8 text-center">
          <Store className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium mb-2">Set up your shop</h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Complete your shop profile to start selling
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;