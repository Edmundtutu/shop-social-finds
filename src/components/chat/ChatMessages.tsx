import React, { useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Circle } from 'lucide-react';
import type { Message } from '@/services/chatService';

interface ChatMessagesProps {
  messages: Message[];
  currentUserId?: string;
  isLoading?: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  isLoading = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const isOwnMessage = (message: Message) => {
    return message.sender_id === currentUserId;
  };

  if (isLoading && messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading messages...</div>
        </div>
      </ScrollArea>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-muted-foreground mb-2">No messages yet</div>
          <div className="text-sm text-muted-foreground">Start the conversation!</div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-3">
        {messages.map((message, index) => {
          const isOwn = isOwnMessage(message);
          const isLastMessage = index === messages.length - 1;
          
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
        })}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
