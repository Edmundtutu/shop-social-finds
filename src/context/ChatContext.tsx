import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message, SendMessagePayload } from '@/services/chatService';
import { getConversation as apiGetConversation, getMessages as apiGetMessages, sendMessage as apiSendMessage, markAsRead as apiMarkRead, getShopConversations as apiGetShopConversations, getUserConversations as apiGetUserConversations, startTyping as apiStartTyping, stopTyping as apiStopTyping, updatePresence as apiUpdatePresence } from '@/services/chatService';
import { getEcho } from '@/services/realtime';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  typingUsers: { [conversationId: number]: { [userId: string]: { name: string; type: string } } };
  onlineUsers: { [conversationId: number]: { [userId: string]: boolean } };
}

interface ChatContextType extends ChatState {
  // Conversation management
  setActiveConversation: (conversation: Conversation | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  ensureConversationForOrder: (orderId: string) => Promise<Conversation>;
  
  // Messaging
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  addMessage: (message: Message) => void;
  
  // Real-time updates
  markAsRead: (conversationId: number) => Promise<void>;
  
  // Typing indicators
  startTyping: (conversationId: number) => Promise<void>;
  stopTyping: (conversationId: number) => Promise<void>;
  
  // Presence
  updatePresence: (conversationId: number, status: 'online' | 'offline') => Promise<void>;
  
  // Utilities
  getConversationById: (id: number) => Conversation | undefined;
  getUnreadCount: (conversationId: number) => number;
  getTypingUsers: (conversationId: number) => { name: string; type: string }[];
  getOnlineUsers: (conversationId: number) => string[];
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: Conversation | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_CONVERSATION_LAST_MESSAGE'; payload: { conversationId: number; message: Message } }
  | { type: 'MARK_MESSAGES_READ'; payload: { conversationId: number; senderType: string } }
  | { type: 'SET_TYPING_USER'; payload: { conversationId: number; userId: string; name: string; type: string } }
  | { type: 'REMOVE_TYPING_USER'; payload: { conversationId: number; userId: string } }
  | { type: 'SET_USER_PRESENCE'; payload: { conversationId: number; userId: string; status: boolean } };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.payload, messages: action.payload ? state.messages : [] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_CONVERSATION_LAST_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? { ...conv, last_message_at: action.payload.message.created_at }
            : conv
        ),
      };
    case 'MARK_MESSAGES_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.conversation_id === action.payload.conversationId &&
          msg.sender_type !== action.payload.senderType &&
          !msg.read_at
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        ),
      };
    case 'SET_TYPING_USER':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: {
            ...state.typingUsers[action.payload.conversationId],
            [action.payload.userId]: {
              name: action.payload.name,
              type: action.payload.type,
            },
          },
        },
      };
    case 'REMOVE_TYPING_USER':
      const { [action.payload.userId]: removed, ...remainingTyping } = state.typingUsers[action.payload.conversationId] || {};
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: remainingTyping,
        },
      };
    case 'SET_USER_PRESENCE':
      return {
        ...state,
        onlineUsers: {
          ...state.onlineUsers,
          [action.payload.conversationId]: {
            ...state.onlineUsers[action.payload.conversationId],
            [action.payload.userId]: action.payload.status,
          },
        },
      };
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, dispatch] = useReducer(chatReducer, {
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    error: null,
    typingUsers: {},
    onlineUsers: {},
  });

  const currentChannelRef = useRef<any>(null);

  // Subscribe to Echo channel for a conversation
  const subscribeToConversation = useCallback((conversationId: number) => {
    try {
      const echo = getEcho();
      // Unsubscribe previous
      if (currentChannelRef.current) {
        try {
          currentChannelRef.current.stopListening('.message.sent');
          echo.leave(`private-conversation.${conversationId}`);
        } catch {}
      }
      const channel = echo.private(`conversation.${conversationId}`);
      
      // Listen for messages
      channel.listen('.message.sent', (event: any) => {
        const incoming: Message = {
          id: event.id,
          conversation_id: event.conversation_id,
          sender_id: event.sender_id,
          sender_type: event.sender_type,
          content: event.content,
          message_type: event.message_type,
          media_url: event.media_url,
          created_at: event.created_at,
          updated_at: event.created_at,
        };
        dispatch({ type: 'ADD_MESSAGE', payload: incoming });
        dispatch({ type: 'UPDATE_CONVERSATION_LAST_MESSAGE', payload: { conversationId, message: incoming } });
      });

      // Listen for typing indicators
      channel.listen('.typing.started', (event: any) => {
        if (event.user_id !== user?.id) {
          dispatch({
            type: 'SET_TYPING_USER',
            payload: {
              conversationId,
              userId: event.user_id,
              name: event.user_name,
              type: event.user_type,
            },
          });
        }
      });

      channel.listen('.typing.stopped', (event: any) => {
        if (event.user_id !== user?.id) {
          dispatch({
            type: 'REMOVE_TYPING_USER',
            payload: {
              conversationId,
              userId: event.user_id,
            },
          });
        }
      });

      // Listen for presence changes
      channel.listen('.presence.changed', (event: any) => {
        if (event.user_id !== user?.id) {
          dispatch({
            type: 'SET_USER_PRESENCE',
            payload: {
              conversationId,
              userId: event.user_id,
              status: event.status === 'online',
            },
          });
        }
      });
      currentChannelRef.current = channel;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Echo subscription failed:', e);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const isVendor = Array.isArray((user as any)?.shops) && (user as any).shops.length > 0;
      const conversations = isVendor ? await apiGetShopConversations() : await apiGetUserConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversations' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  // Ensure a conversation exists for an order and return it
  const ensureConversationForOrder = useCallback(async (orderId: string) => {
    const resp = await apiGetConversation({ order_id: orderId });
    return resp;
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { messages } = await apiGetMessages(conversationId);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (payload: SendMessagePayload) => {
    try {
      const sent = await apiSendMessage(payload);
      dispatch({ type: 'ADD_MESSAGE', payload: sent });
      dispatch({ type: 'UPDATE_CONVERSATION_LAST_MESSAGE', payload: { conversationId: sent.conversation_id, message: sent } });
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'There was an error sending your message.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    dispatch({ type: 'UPDATE_CONVERSATION_LAST_MESSAGE', payload: { conversationId: message.conversation_id, message } });
  }, []);

  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await apiMarkRead(conversationId);
      const senderType = 'user';
      dispatch({ type: 'MARK_MESSAGES_READ', payload: { conversationId, senderType } });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to mark messages as read:', error);
    }
  }, []);

  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation });
    if (conversation) {
      loadMessages(conversation.id);
      subscribeToConversation(conversation.id);
      markAsRead(conversation.id);
    } else {
      dispatch({ type: 'SET_MESSAGES', payload: [] });
    }
  }, [loadMessages, subscribeToConversation, markAsRead]);

  const getConversationById = useCallback((id: number) => {
    return state.conversations.find(conv => conv.id === id);
  }, [state.conversations]);

  const getUnreadCount = useCallback((conversationId: number) => {
    return state.messages.filter(msg => msg.conversation_id === conversationId && !msg.read_at).length;
  }, [state.messages]);

  const startTyping = useCallback(async (conversationId: number) => {
    try {
      await apiStartTyping(conversationId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to start typing:', error);
    }
  }, []);

  const stopTyping = useCallback(async (conversationId: number) => {
    try {
      await apiStopTyping(conversationId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to stop typing:', error);
    }
  }, []);

  const updatePresence = useCallback(async (conversationId: number, status: 'online' | 'offline') => {
    try {
      await apiUpdatePresence(conversationId, status);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update presence:', error);
    }
  }, []);

  const getTypingUsers = useCallback((conversationId: number) => {
    const typing = state.typingUsers[conversationId] || {};
    return Object.values(typing);
  }, [state.typingUsers]);

  const getOnlineUsers = useCallback((conversationId: number) => {
    const online = state.onlineUsers[conversationId] || {};
    return Object.keys(online).filter(userId => online[userId]);
  }, [state.onlineUsers]);

  // Load conversations when user changes/login
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        setActiveConversation,
        loadConversations,
        loadMessages,
        ensureConversationForOrder,
        sendMessage,
        addMessage,
        markAsRead,
        startTyping,
        stopTyping,
        updatePresence,
        getConversationById,
        getUnreadCount,
        getTypingUsers,
        getOnlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
