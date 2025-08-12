import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types/orders';
import { MapPin, User as UserIcon, Store as StoreIcon } from 'lucide-react';

type OrderCardContext = 'customer' | 'vendor';

interface OrderCardProps {
  order: Order;
  context: OrderCardContext;
}

const getStatusBadgeVariant = (status: Order['status']): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'pending':
    case 'processing':
    default:
      return 'default';
  }
};

const formatUGX = (value: number) => `UGX ${Number(value).toLocaleString()}`;

export const OrderCard: React.FC<OrderCardProps> = ({ order, context }) => {
  const createdAt = new Date(order.created_at);
  const deliveryType = order.delivery_address && order.delivery_address !== 'N/A for pickup' ? 'Delivery' : 'Pickup';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm sm:text-base lg:text-lg truncate">
              Order #{order.id}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {createdAt.toLocaleDateString()}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize text-xs">
              {order.status}
            </Badge>
            <p className="text-sm sm:text-base lg:text-lg font-bold mt-1">
              {formatUGX(order.total)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-muted-foreground">
          {context === 'customer' ? (
            <>
              <StoreIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate flex-1">{order.shop?.name ?? 'Shop'}</span>
            </>
          ) : (
            <>
              <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate flex-1">{order.user?.name ?? 'Customer'}</span>
            </>
          )}
          <span className="mx-1 flex-shrink-0">•</span>
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{deliveryType}</span>
        </div>

        <div className="space-y-1.5 flex-1 mb-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="truncate flex-1">
                {(item.product?.name ?? 'Item')} × {item.quantity}
              </span>
              <span className="flex-shrink-0 font-medium">
                {formatUGX(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          <Badge variant="outline" className="text-xs">
            {deliveryType}
          </Badge>
          {order.notes && (
            <Badge 
              variant="outline" 
              className="truncate max-w-[8rem] sm:max-w-[10rem] lg:max-w-[12rem] text-xs" 
              title={order.notes}
            >
              Note: {order.notes}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;