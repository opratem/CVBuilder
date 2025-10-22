import type React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authService, type AuthUser } from '../services/authService'

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, rememberDevice?: boolean) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }, rememberDevice?: boolean) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<{ fullName: string; phone: string }>) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session management helper functions
  const saveRememberedSession = (email: string) => {
    localStorage.setItem('remembered_device', 'true');
    localStorage.setItem('remembered_email', email);
  };

  const clearRememberedSession = () => {
    localStorage.removeItem('remembered_device');
    localStorage.removeItem('remembered_email');
  };

  const isDeviceRemembered = () => {
    return localStorage.getItem('remembered_device') === 'true';
  };

  useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout;

    // Check for existing user session on app start with better error handling
    const initializeAuth = async () => {
      try {
        // Set a longer timeout for initial auth check with proper error handling
        loadingTimeout = setTimeout(() => {
          if (isMounted && isLoading) {
            console.warn('Auth initialization taking longer than expected...');
            console.warn('This may indicate network connectivity issues with Supabase');
            console.warn('The app will continue to try in the background');
            setIsLoading(false); // Stop blocking the UI
          }
        }, 8000); // Increased timeout to allow more time

        console.log('Initializing authentication...');
        const currentUser = await authService.getCurrentUser();

        if (isMounted) {
          if (currentUser) {
            console.log('User session restored successfully');
            setUser(currentUser);
          } else {
            console.log('No active user session found');

            // If no current user but device is remembered, clear invalid session
            if (isDeviceRemembered()) {
              const rememberedEmail = localStorage.getItem('remembered_email');
              if (rememberedEmail) {
                console.log('Clearing expired remembered session for:', rememberedEmail);
                clearRememberedSession();
              }
            }
          }

          clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          // Clear potentially corrupted session data
          clearRememberedSession();
          setUser(null);
          setIsLoading(false);

          // Show user-friendly error message
          if (error instanceof Error && error.message.includes('timeout')) {
            console.warn('Connection timeout - you can still use the app, but authentication features may be limited');
          }
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
      if (isMounted) {
        setUser(authUser);
        setIsLoading(false);
        clearTimeout(loadingTimeout);

        // Clear remembered session if user logs out
        if (!authUser) {
          clearRememberedSession();
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, []);

  const login = async (email: string, password: string, rememberDevice = false) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn({ email, password });
      if (result.success && result.user) {
        setUser(result.user);

        // Save remembered session if requested
        if (rememberDevice) {
          saveRememberedSession(email);
        } else {
          clearRememberedSession();
        }
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string }, rememberDevice = false) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(data);
      if (result.success && result.user) {
        setUser(result.user);

        // Save remembered session if requested
        if (rememberDevice) {
          saveRememberedSession(data.email);
        }
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      clearRememberedSession();
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const resendVerification = async (email: string) => {
    return await authService.resendVerification(email);
  };

  const updateProfile = async (updates: Partial<{ fullName: string; phone: string }>) => {
    const result = await authService.updateProfile(updates);
    if (result.success && user) {
      // Update local user state
      setUser({
        ...user,
        name: updates.fullName ?? user.name,
        phone: updates.phone ?? user.phone
      });
    }
    return result;
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    resetPassword,
    resendVerification,
    updateProfile,
    isLoading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
