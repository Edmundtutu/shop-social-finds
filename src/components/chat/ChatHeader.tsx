import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Store, User, X, Wifi, WifiOff } from 'lucide-react';
import type { Conversation } from '@/services/chatService';

interface ChatHeaderProps {
  conversation: Conversation;
  onClose?: () => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onClose,
  connectionStatus
}) => {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            Order #{conversation.order_id}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{conversation.shop?.name || 'Shop'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getConnectionIcon()}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
