import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image, Mic, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onStartTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false
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
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={messageText}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Chat unavailable" : "Type your message..."}
            className="pr-20"
            disabled={disabled}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              title="Attach file"
              disabled={disabled}
            >
              <Paperclip className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              title="Send image"
              disabled={disabled}
            >
              <Image className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              title="Record audio"
              disabled={disabled}
            >
              <Mic className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!messageText.trim() || disabled}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
