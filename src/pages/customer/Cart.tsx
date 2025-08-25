import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag,
  MapPin,
  Truck,
  Store
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { createOrder } from '@/services/orderService';
import type { CreateOrderPayload, Order } from '@/types/orders';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    getItemsByShop,
    canCheckout,
  } = useCart();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const { mutateAsync: placeOrder, isPending: isProcessingOrder } = useMutation<Order, any, CreateOrderPayload>({
    mutationFn: createOrder,
    onSuccess: (data, variables) => {
      // eslint-disable-next-line no-console
      console.log(`Order placed successfully for shop ${variables.shop_id}!`, data);
    },
    onError: (error: any, variables) => {
      toast({
        title: `Order failed for shop ${variables.shop_id}`,
        description: error?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const itemsByShop = getItemsByShop();
  const total = getTotal();
  const itemCount = getItemCount();
  const deliveryFee = deliveryType === 'delivery' ? 5000 : 0; // 5000 UGX
  const finalTotal = total + deliveryFee;

  const handleCheckout = async () => {
    if (!canCheckout) return;

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      toast({
        title: 'Delivery address required',
        description: 'Please enter your delivery address',
        variant: 'destructive',
      });
      return;
    }

    const deliveryCoords = { lat: 0, lng: 0 };

    const payloads = Object.entries(itemsByShop).map(([groupKey, shopItems]) => {
      const shopIdStr = String(shopItems?.[0]?.shop?.id ?? groupKey);
      const isValidUlid = (val: string) => /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(val);

      if (!shopIdStr || !isValidUlid(shopIdStr)) {
        toast({
          title: 'Checkout failed',
          description: 'Invalid shop identifier. Please try again.',
          variant: 'destructive',
        });
        throw new Error('Invalid ULID for shop_id');
      }

      return {
        shop_id: shopIdStr,
        items: shopItems.map((item) => ({
          product_id: String(item.product.id),
          quantity: item.quantity,
        })),
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : 'N/A for pickup',
        delivery_lat: deliveryCoords.lat,
        delivery_lng: deliveryCoords.lng,
        notes: notes || undefined,
      };
    });

    const orderCreationPromises = payloads.map((p) => placeOrder(p));

    try {
      await Promise.all(orderCreationPromises);
      clearCart();
      toast({
        title: 'OrderHandlers placed successfully!',
        description: 'You can view your orders in your profile.',
      });
      navigate('/profile');
    } catch (error) {
      // Errors handled in onError; keep catch to avoid unhandled rejections
      // eslint-disable-next-line no-console
      console.error('An error occurred during checkout:', error);
    }
  };

  if (!canCheckout) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Button asChild>
              <Link to="/discover">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-2 sm:max-w-6xl sm:mx-auto space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {itemCount} item{itemCount !== 1 ? 's' : ''} from {Object.keys(itemsByShop).length} shop{Object.keys(itemsByShop).length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Cart Items by Shop */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {Object.entries(itemsByShop).map(([shopId, shopItems]) => (
            <Card key={shopId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      {shopItems[0].shop.avatar ? (
                        <img 
                          src={shopItems[0].shop.avatar} 
                          alt={shopItems[0].shop.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {shopItems[0].shop.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{shopItems[0].shop.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Store className="h-3 w-3" />
                        <span>{shopItems.length} item{shopItems.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    UGX {shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {shopItems.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-3 rounded-lg border">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-xl sm:text-2xl">📦</div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${item.product.id}`}
                            className="font-medium hover:text-primary text-sm sm:text-base line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                            {item.product.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ml-2"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="px-3 py-2 min-w-[2.5rem] text-center text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-sm sm:text-base">
                            UGX {(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            UGX {item.price.toLocaleString()} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button variant="outline" asChild>
              <Link to="/discover">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>UGX {total.toLocaleString()}</span>
              </div>
              
              {deliveryType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>UGX {deliveryFee.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>UGX {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={deliveryType} onValueChange={(value: 'pickup' | 'delivery') => setDeliveryType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Pickup (Free)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery (UGX {deliveryFee.toLocaleString()})
                  </Label>
                </div>
              </RadioGroup>

              {deliveryType === 'delivery' && (
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your delivery address..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions for your order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessingOrder || (deliveryType === 'delivery' && !deliveryAddress.trim())}
              >
                {isProcessingOrder ? 'Processing...' : `Checkout - UGX ${finalTotal.toLocaleString()}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;