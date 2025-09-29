import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, User, Store, Package } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { useResponsiveChat } from '@/hooks/useResponsiveChat';
import { useMultiChat } from '@/context/MultiChatContext';
import type { Conversation } from '@/services/chatService';

interface OptimizedConversationListProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OptimizedConversationList: React.FC<OptimizedConversationListProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const chatMode = useResponsiveChat();
  const { openChat } = useMultiChat();
  
  const {
    conversations,
    getUnreadCount,
    getTypingUsers,
    isLoading,
    connectionStatus
  } = useChat();

  // Memoize formatted conversations to prevent unnecessary re-renders
  const formattedConversations = useMemo(() => {
    return conversations.map(conversation => {
      const unreadCount = getUnreadCount(conversation.id);
      const typingUsers = getTypingUsers(conversation.id);
      
      const title = user?.role === 'vendor' 
        ? conversation.user?.name || 'Customer'
        : conversation.shop?.name || 'Shop';
      
      const subtitle = typingUsers.length > 0
        ? `${typingUsers.map(t => t.name).join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
        : (conversation as any).latest_message?.content || 'No messages yet';
      
      const time = conversation.last_message_at 
        ? formatTime(conversation.last_message_at) 
        : '';

      return {
        ...conversation,
        title,
        subtitle,
        time,
        unreadCount,
        typingUsers
      };
    });
  }, [conversations, getUnreadCount, getTypingUsers, user?.role]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationClick = async (conversation: Conversation) => {
    try {
      // Create a mock order object from conversation data
      const order = {
        id: parseInt(conversation.order_id),
        user_id: conversation.user_id,
        shop_id: conversation.shop_id,
        total: 0,
        delivery_address: '',
        delivery_lat: 0,
        delivery_lng: 0,
        phone_number: '',
        notes: '',
        status: 'pending' as const,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        shop: conversation.shop,
        user: conversation.user,
        items: [],
      };
      
      openChat(conversation, order);
      onClose();
    } catch (error) {
      console.error('Failed to open conversation:', error);
    }
  };

  const renderConversationItem = (conversation: any) => (
    <Button
      key={conversation.id}
      variant="ghost"
      className="w-full justify-start p-3 h-auto"
      onClick={() => handleConversationClick(conversation)}
    >
      <div className="flex items-start gap-3 w-full">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.role === 'vendor' ? (
              <User className="h-5 w-5" />
            ) : (
              <Store className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-sm truncate">{conversation.title}</div>
            {conversation.time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="h-3 w-3" />
                {conversation.time}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate mb-1">
            <Package className="h-3 w-3" />
            <span>Order #{conversation.order_id}</span>
          </div>
          <div className={`text-sm truncate ${
            conversation.typingUsers.length > 0 
              ? 'text-blue-600 font-medium' 
              : 'text-muted-foreground'
          }`}>
            {conversation.subtitle}
          </div>
        </div>

        {conversation.unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="h-5 w-5 flex items-center justify-center text-xs p-0 flex-shrink-0"
          >
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading conversations...</div>
        </div>
      );
    }

    if (formattedConversations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-muted-foreground">No conversations yet</div>
          <div className="text-sm text-muted-foreground">
            Start a conversation by placing an order
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {formattedConversations.map(renderConversationItem)}
      </div>
    );
  };

  // Use Sheet for mobile, Dialog for desktop/tablet
  if (chatMode === 'mobile') {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
              {connectionStatus !== 'connected' && (
                <Badge variant="outline" className="ml-auto">
                  {connectionStatus}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Select a conversation to start chatting
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            {renderContent()}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations
            {connectionStatus !== 'connected' && (
              <Badge variant="outline" className="ml-auto">
                {connectionStatus}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Select a conversation to start chatting
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
