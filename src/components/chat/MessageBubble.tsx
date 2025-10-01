import React, { useCallback } from 'react';
import { Circle } from 'lucide-react';
import type { Message } from '@/services/chatService';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isLastMessage: boolean;
  showReadStatus?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  isLastMessage,
  showReadStatus = true
}) => {
  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        <div className={`flex items-center justify-between mt-2 gap-2 ${
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          <span className="text-xs">
            {formatTime(message.created_at)}
          </span>
          
          {isOwn && isLastMessage && showReadStatus && (
            <div className="flex items-center gap-1">
              {message.read_at ? (
                <Circle className="h-3 w-3 fill-blue-400 text-blue-400" />
              ) : (
                <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
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
};
