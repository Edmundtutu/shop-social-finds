import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { DockedConversationList } from './DockedConversationList';
import { useChatLayout } from '@/hooks/useChatLayout';

export const DesktopChatLauncher: React.FC = () => {
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const chatLayout = useChatLayout();
  
  const {
    conversations,
    getUnreadCount,
    connectionStatus
  } = useChat();

  // Memoize total unread count to prevent unnecessary re-renders
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => total + getUnreadCount(conv.id), 0);
  }, [conversations, getUnreadCount]);

  // Only show on desktop
  if (chatLayout === 'mobile') {
    return null;
  }

  const handleToggleConversationList = () => {
    setIsConversationListOpen(!isConversationListOpen);
  };

  const isDisabled = connectionStatus === 'error' || connectionStatus === 'disconnected';

  return (
    <>
      {/* Floating Chat Launcher Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleToggleConversationList}
          className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isDisabled}
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs p-0 min-w-6"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Docked Conversation List */}
      <DockedConversationList
        isOpen={isConversationListOpen}
        onClose={() => setIsConversationListOpen(false)}
      />
    </>
  );
};
