import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import {ChatProvider} from "@/context/ChatContext.tsx";
import { FavoritesProvider } from '../context/FavoritesContext';
import { Toaster } from '../components/ui/toaster';
import ErrorBoundary from '../components/ErrorBoundary';
import AppRoutes from '../routes/AppRoutes';
import '../styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            <ChatProvider>
              <CartProvider>
                <FavoritesProvider>
                  <Router>
                    <div className="App min-h-screen bg-background">
                      <AppRoutes />
                      <Toaster />
                    </div>
                  </Router>
                </FavoritesProvider>
              </CartProvider>
            </ChatProvider>
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;