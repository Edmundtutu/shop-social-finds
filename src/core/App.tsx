import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import {ChatProvider} from "@/context/ChatContext.tsx";
import { MultiChatProvider } from '@/context/MultiChatContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { Toaster } from '../components/ui/toaster';
import { ChatLauncher } from '@/components/shared/ChatLauncher';
import { ChatManager } from '@/components/shared/ChatManager';
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
              <MultiChatProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <Router>
                      <div className="App min-h-screen bg-background">
                        <AppRoutes />
                        <ChatLauncher />
                        <ChatManager />
                        <Toaster />
                      </div>
                    </Router>
                  </FavoritesProvider>
                </CartProvider>
              </MultiChatProvider>
            </ChatProvider>
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;