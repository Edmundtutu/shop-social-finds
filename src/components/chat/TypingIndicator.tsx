import React from 'react';

interface TypingIndicatorProps {
  typingUsers: Array<{ name: string; type: string }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers
}) => {
  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div 
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
              style={{ animationDelay: '0ms' }} 
            />
            <div 
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
              style={{ animationDelay: '150ms' }} 
            />
            <div 
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
              style={{ animationDelay: '300ms' }} 
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      </div>
    </div>
  );
};
