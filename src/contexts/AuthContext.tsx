import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, type User } from '../services/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('eden-user-id');
    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetchMe()
      .then((userData) => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('eden-user-id');
        localStorage.removeItem('eden-email');
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('eden-user-id');
    localStorage.removeItem('eden-email');
    setUser(null);
    navigate('/auth');
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    const userId = localStorage.getItem('eden-user-id');
    if (!userId) return;
    try {
      const userData = await fetchMe();
      setUser(userData);
    } catch {
      localStorage.removeItem('eden-user-id');
      localStorage.removeItem('eden-email');
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
