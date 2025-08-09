import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '@/types';

type FavoritesContextValue = {
  favoriteProducts: Product[];
  isProductFavorited: (productId: string) => boolean;
  addProductToFavorites: (product: Product) => void;
  removeProductFromFavorites: (productId: string) => void;
  toggleProductFavorite: (product: Product) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'favorite_products_v1';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed: Product[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavoriteProducts(parsed);
        }
      }
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteProducts));
    } catch (_) {
      // ignore
    }
  }, [favoriteProducts]);

  const isProductFavorited = (productId: string) => {
    return favoriteProducts.some(p => p.id === productId);
  };

  const addProductToFavorites = (product: Product) => {
    setFavoriteProducts(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [product, ...prev];
    });
  };

  const removeProductFromFavorites = (productId: string) => {
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
  };

  const toggleProductFavorite = (product: Product) => {
    setFavoriteProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [product, ...prev];
    });
  };

  const clearFavorites = () => setFavoriteProducts([]);

  const value = useMemo<FavoritesContextValue>(() => ({
    favoriteProducts,
    isProductFavorited,
    addProductToFavorites,
    removeProductFromFavorites,
    toggleProductFavorite,
    clearFavorites,
  }), [favoriteProducts]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextValue => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};


