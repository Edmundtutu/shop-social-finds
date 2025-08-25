import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, Shop } from '@/types';

export interface CartAddOn {
  id: string;
  product: Product;
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
  discountType?: 'percentage' | 'fixed' | 'none';
  discountValue?: number;
  addedAt: Date;
}

export interface CartItem {
  id: string;
  product: Product;
  shop: Shop;
  quantity: number;
  // base price of the main product (kept for historical accuracy if product.price changes)
  basePrice: number;
  // optional add-ons for this cart item
  addOns?: CartAddOn[];
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
}

interface CartContextType extends CartState {
  addItem: (product: Product, quantity: number, shop: Shop) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearShopItems: (shopId: string) => void;
  getTotal: () => number; // legacy total without add-ons
  getTotalWithAddOns: () => number; // enhanced total including add-ons
  getItemTotalWithAddOns: (itemId: string) => number;
  getItemSavings: (itemId: string) => number;
  getItemAddOns: (itemId: string) => CartAddOn[];
  getItemCount: () => number;
  getShopTotal: (shopId: string) => number;
  getItemsByShop: () => Record<string, CartItem[]>;
  addAddOn: (
    itemId: string,
    addOnProduct: Product,
    quantity: number,
    discountedPrice?: number,
    discountType?: 'percentage' | 'fixed' | 'none',
    discountValue?: number
  ) => void;
  removeAddOn: (itemId: string, addOnId: string) => void;
  updateAddOnQuantity: (itemId: string, addOnId: string, quantity: number) => void;
  canCheckout: boolean;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CLEAR_SHOP_ITEMS'; payload: string }
  | { type: 'ADD_ADDON'; payload: { itemId: string; addOn: CartAddOn } }
  | { type: 'REMOVE_ADDON'; payload: { itemId: string; addOnId: string } }
  | { type: 'UPDATE_ADDON_QTY'; payload: { itemId: string; addOnId: string; quantity: number } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { ...state, items: [...state.items, action.payload] };
      }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'CLEAR_SHOP_ITEMS':
      return {
        ...state,
        items: state.items.filter(item => item.shop.id !== action.payload),
      };

    case 'ADD_ADDON':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? {
                ...item,
                addOns: [...(item.addOns ?? []), action.payload.addOn],
              }
            : item
        ),
      };

    case 'REMOVE_ADDON':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? {
                ...item,
                addOns: (item.addOns ?? []).filter(a => a.id !== action.payload.addOnId),
              }
            : item
        ),
      };

    case 'UPDATE_ADDON_QTY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? {
                ...item,
                addOns: (item.addOns ?? []).map(a =>
                  a.id === action.payload.addOnId ? { ...a, quantity: action.payload.quantity } : a
                ),
              }
            : item
        ),
      };
    
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'shopify-cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: true,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Convert date strings back to Date objects
        const itemsWithDates = parsedCart.map((item: any) => ({
          ...item,
          // migrate legacy price -> basePrice
          basePrice: item.basePrice ?? item.price ?? item.product?.price ?? 0,
          // ensure addOns dates are parsed
          addOns: (item.addOns ?? []).map((a: any) => ({
            ...a,
            addedAt: new Date(a.addedAt),
          })),
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: 'SET_ITEMS', payload: itemsWithDates });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [state.items, state.isLoading]);

  const addItem = (product: Product, quantity: number, shop: Shop) => {
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      shop,
      quantity,
      basePrice: product.price,
      addedAt: new Date(),
    };
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const clearShopItems = (shopId: string) => {
    dispatch({ type: 'CLEAR_SHOP_ITEMS', payload: shopId });
  };

  const getTotal = (): number => {
    return state.items.reduce((total, item) => total + (item.basePrice * item.quantity), 0);
  };

  const getItemCount = (): number => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getShopTotal = (shopId: string): number => {
    return state.items
      .filter(item => item.shop.id === shopId)
      .reduce((total, item) => total + (item.basePrice * item.quantity), 0);
  };

  const getItemsByShop = (): Record<string, CartItem[]> => {
    return state.items.reduce((acc, item) => {
      const shopId = item.shop.id;
      if (!acc[shopId]) {
        acc[shopId] = [];
      }
      acc[shopId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  };

  const canCheckout = state.items.length > 0;

  // Helpers for add-ons and totals
  const getItemAddOns = (itemId: string): CartAddOn[] => {
    const item = state.items.find(i => i.id === itemId);
    return item?.addOns ?? [];
  };

  const getItemTotalWithAddOns = (itemId: string): number => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return 0;
    const addOnsTotalPerMain = (item.addOns ?? []).reduce((sum, a) => sum + a.discountedPrice * a.quantity, 0);
    return item.basePrice * item.quantity + addOnsTotalPerMain * item.quantity;
  };

  const getItemSavings = (itemId: string): number => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return 0;
    return (item.addOns ?? []).reduce((s, a) => s + (a.originalPrice - a.discountedPrice) * a.quantity, 0);
  };

  const getTotalWithAddOns = (): number => {
    return state.items.reduce((sum, item) => sum + getItemTotalWithAddOns(item.id), 0);
  };

  const addAddOn: CartContextType['addAddOn'] = (
    itemId,
    addOnProduct,
    quantity,
    discountedPrice,
    discountType = 'none',
    discountValue
  ) => {
    const addOn: CartAddOn = {
      id: `${addOnProduct.id}-${Date.now()}`,
      product: addOnProduct,
      quantity,
      originalPrice: addOnProduct.price,
      discountedPrice: typeof discountedPrice === 'number' ? discountedPrice : addOnProduct.price,
      discountType,
      discountValue,
      addedAt: new Date(),
    };
    dispatch({ type: 'ADD_ADDON', payload: { itemId, addOn } });
  };

  const removeAddOn: CartContextType['removeAddOn'] = (itemId, addOnId) => {
    dispatch({ type: 'REMOVE_ADDON', payload: { itemId, addOnId } });
  };

  const updateAddOnQuantity: CartContextType['updateAddOnQuantity'] = (itemId, addOnId, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ADDON', payload: { itemId, addOnId } });
    } else {
      dispatch({ type: 'UPDATE_ADDON_QTY', payload: { itemId, addOnId, quantity } });
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearShopItems,
        getTotal,
        getItemCount,
        getShopTotal,
        getItemsByShop,
        getTotalWithAddOns,
        getItemTotalWithAddOns,
        getItemSavings,
        getItemAddOns,
        addAddOn,
        removeAddOn,
        updateAddOnQuantity,
        canCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};