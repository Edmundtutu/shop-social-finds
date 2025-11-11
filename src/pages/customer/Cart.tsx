import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import PaymentModal from '@/components/customer/PayModal';
import MomoPaymentModal from '@/components/customer/MomoPaymentModal';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag,
  MapPin,
  Truck,
  Store,
  X,
  Tag,
  Package,
  PackagePlus,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { createOrderWithPayment, createOrderWithUnifiedPayment } from '@/services/orderService';
import type { CreateOrderPayload, CreateOrderWithPaymentResponse } from '@/types/orders';
import { useAuth } from '@/context/AuthContext';

// Helper Functions
const calculateItemUnitWithAddOns = (item: any) => {
  const base = item.basePrice ?? item.price ?? 0;
  const addOns = (item.addOns ?? []).reduce((sum: number, addOn: any) => sum + (addOn.discountedPrice ?? addOn.originalPrice) * (addOn.quantity ?? 1), 0);
  return base + addOns;
};

const calculatePackageSavings = (item: any) => {
  if (!item.addOns) return 0;
  return item.addOns.reduce((savings: number, addOn: any) => {
    return savings + ((addOn.originalPrice - (addOn.discountedPrice ?? addOn.originalPrice)) * (addOn.quantity ?? 1));
  }, 0);
};

const removeAddOn = (remove: (itemId: string, addOnId: string) => void, itemId: string, addOnId: string) => {
  remove(itemId, addOnId);
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getItemsByShop,
    canCheckout,
    getTotalWithAddOns,
    getItemTotalWithAddOns,
    removeAddOn: removeAddOnFromCart,
  } = useCart();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobilemoneyuganda' | 'momo'>('mobilemoneyuganda');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [expandedShop, setExpandedShop] = useState<string | null>(null);

  // Payment state
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // MoMo payment state
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [momoReferenceId, setMomoReferenceId] = useState<string | null>(null);
  const [momoAmount, setMomoAmount] = useState(0);
  const [momoPayerNumber, setMomoPayerNumber] = useState('');

  const { mutateAsync: placeOrderWithUnifiedPayment, isPending: isProcessingOrder } = useMutation<CreateOrderWithPaymentResponse, any, CreateOrderPayload>({
    mutationFn: createOrderWithUnifiedPayment,
    onSuccess: (data, variables) => {
      if (variables.payment_method === 'momo') {
        const referenceId = data.payment_data?.reference_id;
        if (referenceId) {
          setMomoReferenceId(referenceId);
          setMomoAmount(finalTotal);
          setMomoPayerNumber(customerPhone);
          setShowMomoModal(true);
          toast({
            title: 'MoMo payment initiated!',
            description: 'Please complete payment on your mobile device.',
          });
        } else {
          toast({
            title: 'MoMo payment failed',
            description: 'Failed to get payment reference. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        const paymentUrl = data.payment_url;
        if (paymentUrl) {
          setPaymentUrl(paymentUrl);
          setShowModal(true);
          toast({
            title: 'Payment initiated!',
            description: 'Please complete your payment below.',
          });
        } else {
          toast({
            title: 'Order created successfully!',
            description: 'Your order has been placed and payment is being processed.',
          });
        }
      }
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
  const total = useMemo(() => getTotalWithAddOns(), [items]);
  const itemCount = getItemCount();
  const deliveryFee = deliveryType === 'delivery' ? 5000 : 0;
  const finalTotal = total + deliveryFee;

  const toggleShopExpansion = (shopId: string) => {
    setExpandedShop(expandedShop === shopId ? null : shopId);
  };

  const handleCheckout = async () => {
    if (!canCheckout) return;

    if (!customerEmail.trim() || !customerName.trim()) {
      toast({
        title: 'Payment information required',
        description: 'Please provide your email and name for payment processing',
        variant: 'destructive',
      });
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      toast({
        title: 'Delivery address required',
        description: 'Please enter your delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'momo' && !customerPhone.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please provide your phone number for MoMo payment',
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

      const payload = {
        shop_id: shopIdStr,
        items: shopItems.map((item) => ({
          product_id: String(item.product.id),
          quantity: item.quantity,
          base_price: item.basePrice ?? 0,
          add_ons: (item.addOns ?? []).map((a) => ({
            product_id: String(a.product.id),
            quantity: a.quantity ?? 1,
            original_price: a.originalPrice ?? a.product.price,
            discounted_price: a.discountedPrice ?? a.originalPrice ?? a.product.price,
          })),
          item_total: (item.basePrice ?? 0) * item.quantity + ((item.addOns ?? []).reduce((sum, a) => sum + (a.discountedPrice ?? a.originalPrice) * (a.quantity ?? 1), 0) * item.quantity),
          package_savings: (item.addOns ?? []).reduce((s, a) => s + ((a.originalPrice ?? a.product.price) - (a.discountedPrice ?? a.originalPrice ?? a.product.price)) * (a.quantity ?? 1), 0),
        })),
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : 'N/A for pickup',
        delivery_lat: deliveryCoords.lat,
        delivery_lng: deliveryCoords.lng,
        notes: notes || undefined,
        payment_method: paymentMethod,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
      };

      return payload;
    });

    try {
      const orderCreationPromises = payloads.map((p) => placeOrderWithUnifiedPayment(p));
      await Promise.all(orderCreationPromises);
      
      if (paymentMethod !== 'momo') {
        toast({
          title: 'Orders placed successfully!',
          description: 'Your orders have been created and payment has been initiated.',
        });
      }
    } catch (error) {
      console.error('An error occurred during checkout:', error);
    }
  };

  if (!canCheckout) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Button asChild size="lg">
              <Link to="/discover">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Payment Modal */}
      {showModal && (
        <PaymentModal
          url={paymentUrl}
          onPaymentComplete={(success, txRef) => {
            setShowModal(false);
            if (success) {
              clearCart();
            }
          }}
        />
      )}

      {/* MoMo Payment Modal */}
      {showMomoModal && momoReferenceId && (
        <MomoPaymentModal
          isOpen={showMomoModal}
          onClose={() => setShowMomoModal(false)}
          onPaymentComplete={(success, referenceId) => {
            setShowMomoModal(false);
            setMomoReferenceId(null);
            if (success) {
              clearCart();
            }
          }}
          referenceId={momoReferenceId}
          amount={momoAmount}
          payerNumber={momoPayerNumber}
        />
      )}

      {/* Header Section */}
      <div className="text-left space-y-2">
        <p className="text-muted-foreground text-sm sm:text-base">
          {itemCount} item{itemCount !== 1 ? 's' : ''} from {Object.keys(itemsByShop).length} shop{Object.keys(itemsByShop).length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden space-y-6">
        {/* Cart Items */}
        <div className="space-y-4">
          {Object.entries(itemsByShop).map(([shopId, shopItems]) => (
            <Card key={shopId} className="overflow-hidden">
              <CardHeader 
                className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleShopExpansion(shopId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
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
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{shopItems[0].shop.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Store className="h-3 w-3 flex-shrink-0" />
                        <span>{shopItems.length} item{shopItems.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="whitespace-nowrap">
                      UGX {shopItems.reduce((sum, item) => sum + ((item.basePrice ?? 0) * item.quantity), 0).toLocaleString()}
                    </Badge>
                    {expandedShop === shopId ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {expandedShop === shopId && (
                <CardContent className="space-y-3 pt-0">
                  {shopItems.map((item) => (
                    <CartItem 
                      key={item.id}
                      item={item}
                      removeItem={removeItem}
                      updateQuantity={updateQuantity}
                      removeAddOnFromCart={removeAddOnFromCart}
                      getItemTotalWithAddOns={getItemTotalWithAddOns}
                      calculateItemUnitWithAddOns={calculateItemUnitWithAddOns}
                      calculatePackageSavings={calculatePackageSavings}
                    />
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Order Summary Sticky Bottom */}
        <div className="sticky bottom-0 bg-background border-t p-4 space-y-4 shadow-lg z-10">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>UGX {finalTotal.toLocaleString()}</span>
          </div>
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCheckout}
            disabled={
              isProcessingOrder ||
              (deliveryType === 'delivery' && !deliveryAddress.trim()) || 
              !customerEmail.trim() || 
              !customerName.trim() ||
              (paymentMethod === 'momo' && !customerPhone.trim())
            }
          >
            {isProcessingOrder 
              ? 'Processing...' 
              : paymentMethod === 'momo' 
                ? `Pay with MoMo`
                : `Pay & Place Order`
            }
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={clearCart} className="flex-1">
            Clear Cart
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/discover">Continue Shopping</Link>
          </Button>
        </div>

        {/* Delivery & Payment Sections */}
        <div className="space-y-4">
          <DeliveryOptions 
            deliveryType={deliveryType}
            setDeliveryType={setDeliveryType}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            notes={notes}
            setNotes={setNotes}
            deliveryFee={deliveryFee}
          />
          
          <PaymentInformation
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex gap-8 items-start min-h-[600px] max-h-[80vh]">
          {/* Cart Items - Left Column (Scrollable) */}
          <div className="flex-1 max-w-4xl space-y-6">
            {Object.entries(itemsByShop).map(([shopId, shopItems]) => (
              <Card key={shopId}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        {shopItems[0].shop.avatar ? (
                          <img 
                            src={shopItems[0].shop.avatar} 
                            alt={shopItems[0].shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            {shopItems[0].shop.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{shopItems[0].shop.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Store className="h-4 w-4" />
                          <span>{shopItems.length} item{shopItems.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      UGX {shopItems.reduce((sum, item) => sum + ((item.basePrice ?? 0) * item.quantity), 0).toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {shopItems.map((item) => (
                    <CartItem 
                      key={item.id}
                      item={item}
                      removeItem={removeItem}
                      updateQuantity={updateQuantity}
                      removeAddOnFromCart={removeAddOnFromCart}
                      getItemTotalWithAddOns={getItemTotalWithAddOns}
                      calculateItemUnitWithAddOns={calculateItemUnitWithAddOns}
                      calculatePackageSavings={calculatePackageSavings}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearCart} size="lg">
                Clear Cart
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link to="/discover">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar - Right Column (Fixed) */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-6 h-full overflow-y-auto space-y-6">
              <OrderSummary 
                total={total}
                deliveryFee={deliveryFee}
                finalTotal={finalTotal}
                itemCount={itemCount}
              />
              
              <DeliveryOptions 
                deliveryType={deliveryType}
                setDeliveryType={setDeliveryType}
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                notes={notes}
                setNotes={setNotes}
                deliveryFee={deliveryFee}
              />
              
              <PaymentInformation
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
              />
              
              {/* Checkout Button - Now properly placed at the bottom */}
              <Card className="shadow-lg border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">UGX {finalTotal.toLocaleString()}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleCheckout}
                      disabled={
                        isProcessingOrder ||
                        (deliveryType === 'delivery' && !deliveryAddress.trim()) || 
                        !customerEmail.trim() || 
                        !customerName.trim() ||
                        (paymentMethod === 'momo' && !customerPhone.trim())
                      }
                    >
                      {isProcessingOrder 
                        ? 'Processing...' 
                        : paymentMethod === 'momo' 
                          ? `Pay with MoMo - UGX ${finalTotal.toLocaleString()}`
                          : `Pay & Place Order - UGX ${finalTotal.toLocaleString()}`
                      }
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By proceeding, you agree to our terms and conditions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem: React.FC<any> = ({ 
  item, 
  removeItem, 
  updateQuantity, 
  removeAddOnFromCart, 
  getItemTotalWithAddOns, 
  calculateItemUnitWithAddOns,
  calculatePackageSavings 
}) => {
  return (
    <div className="relative group">
      {/* Package Plus Float Button */}
      <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
              title="Add Package Plus items"
            >
              <Package className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Plus for {item.product.name}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {item.addOns && item.addOns.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <h4 className="font-medium">Current Add-ons</h4>
                    </div>
                    <div className="grid gap-2">
                      {item.addOns.map((addOn: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-background rounded flex items-center justify-center">
                              {addOn.product.images?.[0] ? (
                                <img 
                                  src={addOn.product.images[0]} 
                                  alt={addOn.product.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <span className="text-xs">📦</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{addOn.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                UGX {addOn.discountedPrice?.toLocaleString()} 
                                <span className="line-through ml-1">
                                  UGX {addOn.originalPrice.toLocaleString()}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeAddOn(removeAddOnFromCart, item.id, addOn.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <Link 
                    to={`/shops/${item.shop.id}?addOnFor=${item.product.id}&cartItemId=${item.id}`}
                    className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <PackagePlus className="h-5 w-5" />
                    <span className="font-medium">Browse Shop for Add-ons</span>
                  </Link>
                </div>
                
                {item.addOns && item.addOns.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Package Savings</span>
                      <span className="font-bold text-green-600">
                        UGX {calculatePackageSavings(item).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      You're saving with this package deal!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Main Item Card */}
      <div className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
        {/* Product Image */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
          {item.product.images?.[0] ? (
            <img 
              src={item.product.images[0]} 
              alt={item.product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-2xl">📦</div>
          )}
          
          {item.addOns && item.addOns.length > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              +{item.addOns.length}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-1">
              <Link 
                to={`/product/${item.product.id}`}
                className="font-semibold hover:text-primary text-base line-clamp-2"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.product.description}
              </p>
              
              {item.addOns && item.addOns.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.addOns.slice(0, 2).map((addOn: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      + {addOn.product.name}
                    </Badge>
                  ))}
                  {item.addOns.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.addOns.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ml-2"
            >
              <Trash2 className="h-4 w-4" />
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
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-3 py-2 min-w-[2.5rem] text-center font-medium">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-base">
                UGX {getItemTotalWithAddOns(item.id).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                UGX {calculateItemUnitWithAddOns(item).toLocaleString()} each
                {item.addOns && item.addOns.length > 0 && (
                  <span className="text-green-600 block">
                    (Package Deal)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Summary Component
const OrderSummary: React.FC<any> = ({ total, deliveryFee, finalTotal, itemCount }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span>UGX {total.toLocaleString()}</span>
        </div>
        
        {deliveryFee > 0 && (
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>UGX {deliveryFee.toLocaleString()}</span>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>UGX {finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Delivery Options Component
const DeliveryOptions: React.FC<any> = ({
  deliveryType,
  setDeliveryType,
  deliveryAddress,
  setDeliveryAddress,
  notes,
  setNotes,
  deliveryFee
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={deliveryType} onValueChange={(value: 'pickup' | 'delivery') => setDeliveryType(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer">
              <MapPin className="h-4 w-4" />
              Pickup (Free)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer">
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
              className="min-h-[80px]"
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
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Payment Information Component
const PaymentInformation: React.FC<any> = ({
  paymentMethod,
  setPaymentMethod,
  customerEmail,
  setCustomerEmail,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer_name">Full Name</Label>
          <input
            id="customer_name"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_email">Email Address</Label>
          <input
            id="customer_email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email address"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_phone">Phone Number</Label>
          <input
            id="customer_phone"
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number (e.g., 256700123456)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required={paymentMethod === 'momo'}
          />
          {paymentMethod === 'momo' && (
            <p className="text-xs text-muted-foreground">
              Required for MoMo payment. Use format: 256XXXXXXXXX
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value: 'card' | 'mobilemoneyuganda' | 'momo') => setPaymentMethod(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mobilemoneyuganda" id="mobilemoney" />
              <Label htmlFor="mobilemoney" className="flex items-center gap-2 cursor-pointer">
                <span>Mobile Money Uganda (Flutterwave)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="momo" id="momo" />
              <Label htmlFor="momo" className="flex items-center gap-2 cursor-pointer">
                <Smartphone className="h-4 w-4" />
                <span>Pay with MoMo</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                <span>Card Payment</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default Cart;