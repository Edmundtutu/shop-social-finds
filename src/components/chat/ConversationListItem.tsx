import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, User, Store, Package } from 'lucide-react';
import type { Conversation } from '@/services/chatService';

interface ConversationListItemProps {
  conversation: Conversation & {
    title: string;
    subtitle: string;
    time: string;
    unreadCount: number;
    typingUsers: Array<{ name: string; type: string }>;
  };
  userRole: string;
  onClick: (conversation: Conversation) => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  userRole,
  onClick
}) => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start p-4 h-auto border-b border-border/50 hover:bg-muted/50"
      onClick={() => onClick(conversation)}
    >
      <div className="flex items-start gap-3 w-full">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userRole === 'vendor' ? (
              <User className="h-6 w-6" />
            ) : (
              <Store className="h-6 w-6" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-base truncate">{conversation.title}</div>
            {conversation.time && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                <Clock className="h-4 w-4" />
                {conversation.time}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate mb-2">
            <Package className="h-4 w-4" />
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
            className="h-6 w-6 flex items-center justify-center text-sm p-0 flex-shrink-0"
          >
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  );
};
