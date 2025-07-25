'use client';

import { ROUTES } from '@/constants/routes';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';

/* eslint-disable @typescript-eslint/no-empty-function */

// Define the shape of the user object
interface User {
  id: string;
  email: string;
  name: string;
}

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {}
});

// Create a custom hook for easy consumption of the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const res = await fetch(`${ROUTES.API}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string) => {
    try {
      const res = await fetch(ROUTES.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      const { access_token } = await res.json();
      localStorage.setItem('authToken', access_token);
      setToken(access_token);

      // Fetch profile after getting token
      const profileRes = await fetch(`${ROUTES.API}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      if (profileRes.ok) {
        const userData = await profileRes.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch profile after login');
      }
    } catch (error) {
      console.error(error);
      // Ensure state is clean on failure
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      throw error; // Re-throw error to be caught by the form handler
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    // Optionally redirect to home or login page
    window.location.href = '/';
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
