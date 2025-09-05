import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle, Clock, CheckCheck } from 'lucide-react';

interface ChatStatusIndicatorProps {
  status: 'online' | 'offline' | 'typing' | 'away';
  lastSeen?: string;
  className?: string;
}

export const ChatStatusIndicator: React.FC<ChatStatusIndicatorProps> = ({
  status,
  lastSeen,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: <Circle className="h-2 w-2 fill-green-500 text-green-500" />,
          text: 'Online',
          color: 'text-green-600'
        };
      case 'typing':
        return {
          icon: <Circle className="h-2 w-2 fill-blue-500 text-blue-500 animate-pulse" />,
          text: 'Typing...',
          color: 'text-blue-600'
        };
      case 'away':
        return {
          icon: <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />,
          text: 'Away',
          color: 'text-yellow-600'
        };
      default:
        return {
          icon: <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />,
          text: lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline',
          color: 'text-gray-500'
        };
    }
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    
    const diffInHours = diffInMinutes / 60;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    
    const diffInDays = diffInHours / 24;
    if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
    
    return date.toLocaleDateString();
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {config.icon}
      <span className={`text-xs ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};