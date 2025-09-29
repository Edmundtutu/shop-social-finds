import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message, SendMessagePayload } from '@/services/chatService';
import { getConversation as apiGetConversation, getMessages as apiGetMessages, sendMessage as apiSendMessage, markAsRead as apiMarkRead, getShopConversations as apiGetShopConversations, getUserConversations as apiGetUserConversations, startTyping as apiStartTyping, stopTyping as apiStopTyping } from '@/services/chatService';
import { getEcho } from '@/services/realtime';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  typingUsers: { [conversationId: number]: { [userId: string]: { name: string; type: string } } };
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

interface ChatContextType extends ChatState {
  // Conversation management
  setActiveConversation: (conversation: Conversation | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  ensureConversationForOrder: (orderId: string) => Promise<Conversation>;
  
  // Messaging
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  
  // Real-time updates
  markAsRead: (conversationId: number) => Promise<void>;
  
  // Typing indicators
  startTyping: (conversationId: number) => Promise<void>;
  stopTyping: (conversationId: number) => Promise<void>;
  
  // Utilities
  getConversationById: (id: number) => Conversation | undefined;
  getUnreadCount: (conversationId: number) => number;
  getTypingUsers: (conversationId: number) => { name: string; type: string }[];
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
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' | 'error' };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload ?? [] };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.payload, messages: action.payload ? state.messages : [] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_CONVERSATION_LAST_MESSAGE':
      return {
        ...state,
        conversations: (state.conversations || []).map(conv =>
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
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
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
    connectionStatus: 'disconnected',
  });

  const currentChannelRef = useRef<any>(null);
  const stateRef = useRef(state);
  
  // Keep state ref updated
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Subscribe to Echo channel for a conversation - CORE REAL-TIME FUNCTIONALITY
  const subscribeToConversation = useCallback((conversationId: number) => {
    console.log('🔌 Subscribing to conversation:', conversationId);
    
    try {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
      
      const echo = getEcho();
      
      // Unsubscribe from previous channel
      if (currentChannelRef.current) {
        try {
          currentChannelRef.current.stopListening('.message.sent');
          currentChannelRef.current.stopListening('.typing.started');
          currentChannelRef.current.stopListening('.typing.stopped');
          echo.leave(`conversation.${currentChannelRef.current.conversationId}`);
          console.log('🔌 Unsubscribed from previous channel');
        } catch (error) {
          console.warn('Error unsubscribing from previous channel:', error);
        }
      }
      
      const channel = echo.private(`conversation.${conversationId}`);
      channel.conversationId = conversationId;
      
      // Listen for new messages - THIS IS THE CORE REAL-TIME FUNCTIONALITY
      channel.listen('.message.sent', (event: any) => {
        console.log('📨 REAL-TIME MESSAGE RECEIVED:', event);
        
        const incomingMessage: Message = {
          id: event.id,
          conversation_id: event.conversation_id,
          sender_id: event.sender_id,
          sender_type: event.sender_type,
          content: event.content,
          message_type: event.message_type,
          media_url: event.media_url,
          created_at: event.created_at,
          updated_at: event.updated_at || event.created_at,
          read_at: event.read_at,
        };
        
        // Only add if it's for the current conversation and doesn't already exist
        if (incomingMessage.conversation_id === conversationId) {
          const existingMessage = stateRef.current.messages.find(msg => msg.id === incomingMessage.id);
        if (!existingMessage) {
            console.log('✅ Adding new message to state:', incomingMessage.id);
            dispatch({ type: 'ADD_MESSAGE', payload: incomingMessage });
            dispatch({ type: 'UPDATE_CONVERSATION_LAST_MESSAGE', payload: { conversationId, message: incomingMessage } });
          }
        }
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
      
      currentChannelRef.current = channel;
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      console.log('✅ Successfully subscribed to conversation channel:', conversationId);
      
    } catch (error) {
      console.error('❌ Echo subscription failed:', error);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
      dispatch({ type: 'SET_ERROR', payload: 'Real-time connection failed' });
    }
  }, [user]);

  // Load conversations - ONLY called when explicitly needed
  const loadConversations = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const isVendor = Array.isArray((user as any)?.shops) && (user as any).shops.length > 0;
      const conversations = isVendor ? await apiGetShopConversations() : await apiGetUserConversations();
      const safeConversations = Array.isArray(conversations) ? conversations : [];
      dispatch({ type: 'SET_CONVERSATIONS', payload: safeConversations });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversations' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  // Ensure a conversation exists for an order and return it
  const ensureConversationForOrder = useCallback(async (orderId: string) => {
    try {
      const resp = await apiGetConversation({ order_id: orderId });
      return resp;
    } catch (error) {
      console.error('❌ Failed to get/create conversation:', error);
      throw error;
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { messages } = await apiGetMessages(conversationId);
      const safeMessages = Array.isArray(messages) ? messages : [];
      dispatch({ type: 'SET_MESSAGES', payload: safeMessages });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (payload: SendMessagePayload): Promise<void> => {
    try {
      console.log('📤 Sending message:', payload);
      const sent = await apiSendMessage(payload);
      console.log('✅ Message sent successfully:', sent.id);
      
      // Optimistically add the message to state immediately
      const optimisticMessage: Message = {
        ...sent,
        updated_at: sent.created_at,
        read_at: undefined,
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: optimisticMessage });
      dispatch({ type: 'UPDATE_CONVERSATION_LAST_MESSAGE', payload: { conversationId: payload.conversation_id, message: optimisticMessage } });
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast({
        title: 'Failed to send message',
        description: 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await apiMarkRead(conversationId);
      const senderType = 'user';
      dispatch({ type: 'MARK_MESSAGES_READ', payload: { conversationId, senderType } });
    } catch (error) {
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
    const conversation = state.conversations.find(conv => conv.id === conversationId) as any;
    if (!conversation) return 0;

    const conversationMessages = state.messages.filter(msg => msg.conversation_id === conversationId);
    if (conversationMessages.length > 0) {
      return conversationMessages.filter(msg => !msg.read_at && msg.sender_id !== user?.id).length;
    }

    if (typeof conversation.unread_count === 'number') {
      return conversation.unread_count;
    }

    const latest = conversation.latest_message;
    if (latest && !latest.read_at && latest.sender_id !== user?.id) {
      return 1;
    }

    return 0;
  }, [state.messages, state.conversations, user?.id]);

  const startTyping = useCallback(async (conversationId: number) => {
    try {
      await apiStartTyping(conversationId);
    } catch (error) {
      console.error('Failed to start typing:', error);
    }
  }, []);

  const stopTyping = useCallback(async (conversationId: number) => {
    try {
      await apiStopTyping(conversationId);
    } catch (error) {
      console.error('Failed to stop typing:', error);
    }
  }, []);

  const getTypingUsers = useCallback((conversationId: number) => {
    const typing = state.typingUsers[conversationId] || {};
    return Object.values(typing);
  }, [state.typingUsers]);

  // ONLY load conversations when user changes - NO AUTOMATIC POLLING
  useEffect(() => {
    if (user) {
      loadConversations();
    }

    // Cleanup function
    return () => {
      if (currentChannelRef.current) {
        try {
          const echo = getEcho();
          currentChannelRef.current.stopListening('.message.sent');
          currentChannelRef.current.stopListening('.typing.started');
          currentChannelRef.current.stopListening('.typing.stopped');
          echo.leave(`conversation.${currentChannelRef.current.conversationId}`);
        } catch (error) {
          console.warn('Error during chat cleanup:', error);
        }
        currentChannelRef.current = null;
      }
    };
  }, [user]); // ONLY user dependency - NO loadConversations dependency

  return (
    <ChatContext.Provider
      value={{
        ...state,
        setActiveConversation,
        loadConversations,
        loadMessages,
        ensureConversationForOrder,
        sendMessage,
        markAsRead,
        startTyping,
        stopTyping,
        getConversationById,
        getUnreadCount,
        getTypingUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
