import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import type { Conversation, Message } from '@/services/chatService';

interface ChatContainerProps {
  conversation: Conversation;
  onClose?: () => void;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  conversation,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const {
    messages,
    sendMessage,
    startTyping,
    stopTyping,
    getTypingUsers,
    markAsRead,
    isLoading,
    connectionStatus
  } = useChat();

  // Filter messages for this conversation
  const conversationMessages = messages.filter(msg => msg.conversation_id === conversation.id);
  const typingUsers = getTypingUsers(conversation.id);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversation.id) {
      markAsRead(conversation.id);
    }
  }, [conversation.id, markAsRead]);

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      await sendMessage({
        conversation_id: conversation.id,
        content,
        message_type: 'text'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [conversation.id, sendMessage]);

  const handleStartTyping = useCallback(() => {
    startTyping(conversation.id);
  }, [conversation.id, startTyping]);

  const handleStopTyping = useCallback(() => {
    stopTyping(conversation.id);
  }, [conversation.id, stopTyping]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <ChatHeader 
        conversation={conversation}
        onClose={onClose}
        connectionStatus={connectionStatus}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        <ChatMessages 
          messages={conversationMessages}
          currentUserId={user?.id}
          isLoading={isLoading}
        />
        
        <ChatTypingIndicator typingUsers={typingUsers} />
        
        <ChatInput
          onSendMessage={handleSendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          disabled={isLoading || connectionStatus !== 'connected'}
        />
      </div>
    </div>
  );
};
