import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthUser, AuthState, RegisterData } from '@/types/auth';
import { TEST_USERS, TEST_CREDENTIALS } from '@/types/test-data';
import { INFLUENCER_THRESHOLD } from '@/utils/constants';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
  updateUser: (user: AuthUser) => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = () => {
      // Check for stored user session
      const storedUser = localStorage.getItem('auth-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // Recalculate influencer status based on current threshold
          user.isInfluencer = user.followers >= INFLUENCER_THRESHOLD;
          dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
          localStorage.removeItem('auth-user');
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Check test credentials
      if (TEST_CREDENTIALS[email as keyof typeof TEST_CREDENTIALS] === password) {
        const testUser = Object.values(TEST_USERS).find(user => user.email === email);
        if (testUser) {
          localStorage.setItem('auth-user', JSON.stringify(testUser));
          dispatch({ type: 'SET_USER', payload: testUser });
          return;
        }
      }
      
      // TODO: Replace with actual API call
      throw new Error('Invalid credentials');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: Replace with actual API call
      const newUser: AuthUser = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role || 'customer',
        followers: 0,
        following: 0,
        isInfluencer: false,
        verified: false,
        createdAt: new Date(),
      };
      
      localStorage.setItem('auth-user', JSON.stringify(newUser));
      dispatch({ type: 'SET_USER', payload: newUser });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('auth-user');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const loginAsGuest = () => {
    dispatch({ type: 'SET_USER', payload: TEST_USERS.guest });
  };

  const updateUser = (user: AuthUser) => {
    // Recalculate influencer status
    const updatedUser = {
      ...user,
      isInfluencer: user.followers >= INFLUENCER_THRESHOLD,
    };
    
    if (updatedUser.role !== 'guest') {
      localStorage.setItem('auth-user', JSON.stringify(updatedUser));
    }
    
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        loginAsGuest,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};