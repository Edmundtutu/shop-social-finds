import React, { useMemo } from 'react';
import { useMultiChat } from '@/context/MultiChatContext';
import { useChat } from '@/context/ChatContext';
import { DockedChatWindow } from './DockedChatWindow';
import { DockedConversationList } from './DockedConversationList';
import { useChatLayout } from '@/hooks/useChatLayout';

export const DockedChatManager: React.FC = () => {
  const { openChats, closeChat, minimizeChat, maximizeChat } = useMultiChat();
  const { setActiveConversation, activeConversation } = useChat();
  const chatLayout = useChatLayout();
  
  // Memoize chats to render to prevent unnecessary re-renders
  const chatsToRender = useMemo(() => {
    return Array.from(openChats.values());
  }, [openChats]);
  
  // Early return for mobile to prevent any processing
  if (chatLayout === 'mobile') {
    return null;
  }

  const handleChatAction = async (orderId: string, action: 'open' | 'close' | 'minimize' | 'maximize') => {
    const chat = openChats.get(orderId);
    if (!chat) return;

    switch (action) {
      case 'open':
        if (activeConversation?.id !== chat.conversation.id) {
          setActiveConversation(chat.conversation);
        }
        break;
      case 'close':
        closeChat(orderId);
        if (activeConversation?.id === chat.conversation.id) {
          setActiveConversation(null);
        }
        break;
      case 'minimize':
        minimizeChat(orderId);
        break;
      case 'maximize':
        maximizeChat(orderId);
        if (activeConversation?.id !== chat.conversation.id) {
          setActiveConversation(chat.conversation);
        }
        break;
    }
  };

  if (chatsToRender.length === 0) {
    return null;
  }
  
  return (
    <>
      {chatsToRender.map(({ conversation, order, isMinimized, position }) => {
        const orderId = String(order.id);
        const isActive = activeConversation?.id === conversation.id;
        
        // Only render the chat window if it's the active conversation
        if (!isActive) {
          return null;
        }

        return (
          <DockedChatWindow
            key={orderId}
            conversation={conversation}
            order={order}
            isMinimized={isMinimized}
            position={position}
            onClose={() => handleChatAction(orderId, 'close')}
            onMinimize={() => handleChatAction(orderId, 'minimize')}
            onMaximize={() => handleChatAction(orderId, 'maximize')}
          />
        );
      })}
    </>
  );
};
