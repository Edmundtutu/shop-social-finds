import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onStartTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || disabled) return;

    try {
      // Stop typing indicator when sending
      if (isTyping) {
        onStopTyping();
        setIsTyping(false);
      }

      await onSendMessage(messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [messageText, disabled, isTyping, onSendMessage, onStopTyping]);

  const handleTyping = useCallback((text: string) => {
    setMessageText(text);
    
    if (disabled) return;

    // Start typing if not already typing
    if (!isTyping && text.trim()) {
      setIsTyping(true);
      onStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        onStopTyping();
        setIsTyping(false);
      }
    }, 2000);
  }, [disabled, isTyping, onStartTyping, onStopTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Input
          value={messageText}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="pr-12"
          disabled={disabled}
        />
      </div>
      <Button
        onClick={handleSendMessage}
        disabled={!messageText.trim() || disabled}
        size="icon"
        className="h-10 w-10"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
