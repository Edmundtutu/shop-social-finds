import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, User, Store, AlertTriangle, Package } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatStatusIndicator } from './ChatStatusIndicator';
import type { Conversation } from '@/services/chatService';

interface ConversationListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
}) => {
  const { user } = useAuth();
  
  // Safely get chat context with error handling
  let conversations: Conversation[] = [];
  let getUnreadCount = (id: number) => 0;
  let isLoading = false;
  let chatError: string | null = null;

  try {
    const chatContext = useChat();
    conversations = chatContext.conversations || [];
    getUnreadCount = chatContext.getUnreadCount || (() => 0);
    isLoading = chatContext.isLoading || false;
  } catch (error) {
    console.warn('Chat context not available in ConversationList:', error);
    chatError = 'Chat service is currently unavailable';
  }

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

  const getConversationTitle = (conversation: Conversation) => {
    if (user?.role === 'vendor') {
      return conversation.user?.name || 'Customer';
    } else {
      return conversation.shop?.name || 'Shop';
    }
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.latestMessage) {
      const prefix = conversation.latestMessage.sender_type === 'user' ? 'You: ' : '';
      return `${prefix}${conversation.latestMessage.content}`;
    }
    return 'No messages yet';
  };

  const handleConversationClick = (conversation: Conversation) => {
    onSelectConversation(conversation);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations
          </DialogTitle>
          <DialogDescription>
            Select a conversation to start chatting
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2">
            {chatError ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{chatError}</AlertDescription>
                </Alert>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-muted-foreground">No conversations yet</div>
                <div className="text-sm text-muted-foreground">
                  Start a conversation by placing an order
                </div>
              </div>
            ) : (
              conversations.map((conversation) => {
                const unreadCount = getUnreadCount(conversation.id);
                const title = getConversationTitle(conversation);
                const subtitle = getConversationSubtitle(conversation);
                const time = conversation.last_message_at ? formatTime(conversation.last_message_at) : '';

                return (
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
                          <div className="font-medium text-sm truncate">{title}</div>
                          {time && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {time}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate mb-1">
                          <Package className="h-3 w-3" />
                          <span>Order #{conversation.order_id}</span>
                          <ChatStatusIndicator 
                            status="offline" 
                            lastSeen={conversation.last_message_at}
                            className="ml-auto"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {subtitle}
                        </div>
                      </div>

                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 w-5 flex items-center justify-center text-xs p-0 flex-shrink-0"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
