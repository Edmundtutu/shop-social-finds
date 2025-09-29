import React, { useMemo } from 'react';
import { useMultiChat } from '@/context/MultiChatContext';
import { useResponsiveChat } from '@/hooks/useResponsiveChat';
import { useChat } from '@/context/ChatContext';
import { UnifiedChatDialog } from './UnifiedChatDialog';
import { createPortal } from 'react-dom';

export const OptimizedChatManager: React.FC = () => {
  const { openChats, closeChat, minimizeChat, maximizeChat } = useMultiChat();
  const chatMode = useResponsiveChat();
  const { setActiveConversation, activeConversation } = useChat();
  
  // Memoize chats to render to prevent unnecessary re-renders
  const chatsToRender = useMemo(() => {
    return chatMode === 'mobile' 
      ? Array.from(openChats.values()).slice(-1) // Only show the most recent on mobile
      : Array.from(openChats.values());
  }, [openChats, chatMode]);

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
      {chatsToRender.map(({ conversation, order, isMinimized }) => {
        const orderId = String(order.id);
        const isActive = activeConversation?.id === conversation.id;
        
        // Only render the chat dialog if it's the active conversation
        // This prevents unnecessary re-renders and state conflicts
        if (!isActive) {
          return null;
        }

        return (
          <UnifiedChatDialog
            key={orderId}
            conversation={conversation}
            isOpen={!isMinimized}
            onClose={() => handleChatAction(orderId, 'close')}
          />
        );
      })}
    </>
  );
};
