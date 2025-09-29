import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChatContainer } from './ChatContainer';
import type { Conversation } from '@/services/chatService';

interface UnifiedChatDialogProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export const UnifiedChatDialog: React.FC<UnifiedChatDialogProps> = ({
  conversation,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <ChatContainer 
          conversation={conversation}
          onClose={onClose}
          className="h-full"
        />
      </DialogContent>
    </Dialog>
  );
};
