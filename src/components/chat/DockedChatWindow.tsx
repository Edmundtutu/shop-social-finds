import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Minus, Package, Store, User, Circle, Send } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { TypingIndicator } from './TypingIndicator';
import type { Conversation } from '@/services/chatService';
import type { Order } from '@/types/orders';

interface DockedChatWindowProps {
  conversation: Conversation;
  order: Order;
  isMinimized: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

export const DockedChatWindow: React.FC<DockedChatWindowProps> = ({
  conversation,
  order,
  isMinimized,
  position,
  onClose,
  onMinimize,
  onMaximize
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Filter messages for this conversation
  const conversationMessages = messages.filter(msg => msg.conversation_id === conversation.id);
  const typingUsers = getTypingUsers(conversation.id);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversation.id) {
      markAsRead(conversation.id);
    }
  }, [conversation.id, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim()) return;

    try {
      // Stop typing indicator when sending
      if (isTyping) {
        await stopTyping(conversation.id);
        setIsTyping(false);
      }

      await sendMessage({
        conversation_id: conversation.id,
        content: messageText.trim(),
        message_type: 'text'
      });
      
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [messageText, conversation.id, isTyping, sendMessage, stopTyping]);

  const handleTyping = useCallback((text: string) => {
    setMessageText(text);
    
    // Start typing if not already typing
    if (!isTyping && text.trim()) {
      setIsTyping(true);
      startTyping(conversation.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      if (isTyping) {
        await stopTyping(conversation.id);
        setIsTyping(false);
      }
    }, 2000);
  }, [conversation.id, isTyping, startTyping, stopTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const isOwnMessage = (message: any) => {
    return message.sender_id === user?.id;
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (isMinimized) {
    return (
      <div
        className="fixed bg-card border rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-shadow z-50"
        style={{
          left: position.x,
          top: position.y,
          minWidth: '200px'
        }}
        onClick={onMaximize}
      >
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Order #{conversation.order_id}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bg-card border rounded-lg shadow-lg flex flex-col z-50"
      style={{
        left: position.x,
        top: position.y,
        width: '400px',
        height: '500px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            Order #{conversation.order_id}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMinimize}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {conversationMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-muted-foreground mb-2">No messages yet</div>
              <div className="text-sm text-muted-foreground">Start the conversation!</div>
            </div>
          ) : (
            conversationMessages.map((message, index) => {
              const isOwn = isOwnMessage(message);
              const isLastMessage = index === conversationMessages.length - 1;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    
                    <div className={`flex items-center justify-between mt-1 gap-2 ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <span className="text-xs">
                        {formatTime(message.created_at)}
                      </span>
                      
                      {isOwn && isLastMessage && (
                        <div className="flex items-center gap-1">
                          {message.read_at ? (
                            <Circle className="h-2 w-2 fill-blue-400 text-blue-400" />
                          ) : (
                            <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                          )}
                          <span className="text-xs">
                            {message.read_at ? 'Read' : 'Sent'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          <TypingIndicator typingUsers={typingUsers} />
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-3 border-t bg-muted/50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={connectionStatus !== 'connected' ? "Connecting..." : "Type your message..."}
              className="pr-10"
              disabled={isLoading || connectionStatus !== 'connected'}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isLoading || connectionStatus !== 'connected'}
            size="icon"
            className="h-8 w-8"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
