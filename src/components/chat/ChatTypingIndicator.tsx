import React from 'react';

interface ChatTypingIndicatorProps {
  typingUsers: Array<{ name: string; type: string }>;
}

export const ChatTypingIndicator: React.FC<ChatTypingIndicatorProps> = ({
  typingUsers
}) => {
  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2">
      <div className="flex justify-start">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div 
                className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" 
                style={{ animationDelay: '0ms' }} 
              />
              <div 
                className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" 
                style={{ animationDelay: '150ms' }} 
              />
              <div 
                className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" 
                style={{ animationDelay: '300ms' }} 
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
