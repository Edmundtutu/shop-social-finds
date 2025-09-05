
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Image, Mic, Paperclip, Circle } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types/orders';

interface ChatDialogProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({ order, isOpen, onClose }) => {
  const { user } = useAuth();
  const { 
    activeConversation, 
    messages, 
    sendMessage, 
    setActiveConversation,
    ensureConversationForOrder,
    isLoading,
    startTyping,
    stopTyping,
    updatePresence,
    getTypingUsers,
    getOnlineUsers
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation when dialog opens
  useEffect(() => {
    const init = async () => {
      if (!isOpen || !order?.id) return;
      try {
        const conversation = await ensureConversationForOrder(String(order.id));
        setActiveConversation(conversation);
        // Set user as online when opening chat
        if (conversation) {
          updatePresence(conversation.id, 'online');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to init conversation:', e);
      }
    };
    init();
  }, [isOpen, order?.id, ensureConversationForOrder, setActiveConversation, updatePresence]);

  // Set user as offline when closing chat
  useEffect(() => {
    if (!isOpen && activeConversation) {
      updatePresence(activeConversation.id, 'offline');
    }
  }, [isOpen, activeConversation, updatePresence]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation) return;

    try {
      // Stop typing indicator when sending
      if (isTyping) {
        await stopTyping(activeConversation.id);
        setIsTyping(false);
      }

      await sendMessage({
        conversation_id: activeConversation.id,
        content: messageText.trim(),
        message_type: 'text',
      });
      setMessageText('');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = async (text: string) => {
    setMessageText(text);
    
    if (!activeConversation) return;

    // Start typing if not already typing
    if (!isTyping && text.trim()) {
      setIsTyping(true);
      await startTyping(activeConversation.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      if (isTyping) {
        await stopTyping(activeConversation.id);
        setIsTyping(false);
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get typing users and online users for current conversation
  const typingUsers = activeConversation ? getTypingUsers(activeConversation.id) : [];
  const onlineUsers = activeConversation ? getOnlineUsers(activeConversation.id) : [];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message: any) => {
    return message.sender_id === user?.id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline">Order #{order.id}</Badge>
            <span>Chat with {order.shop?.name || 'Shop'}</span>
            {onlineUsers.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            Communicate with {order.shop?.name || 'the shop'} about your order details and any questions you may have.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        isOwnMessage(message)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage(message) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={messageText}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="Attach file"
                >
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="Send image"
                >
                  <Image className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="Record audio"
                >
                  <Mic className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
