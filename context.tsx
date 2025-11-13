'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PasswordProtectConfig } from './types';

interface PasswordProtectContextValue {
  isAuthenticated: boolean;
  authenticate: (password: string) => Promise<boolean>;
  logout: () => void;
  config: PasswordProtectConfig;
}

const PasswordProtectContext = createContext<PasswordProtectContextValue | undefined>(undefined);

export function usePasswordProtect() {
  const context = useContext(PasswordProtectContext);
  if (!context) {
    throw new Error('usePasswordProtect must be used within PasswordProtectProvider');
  }
  return context;
}

interface PasswordProtectProviderProps {
  children: ReactNode;
  config: PasswordProtectConfig;
}

export function PasswordProtectProvider({ children, config }: PasswordProtectProviderProps) {
  const storageKey = config.storageKey || 'password-protect-auth';
  const persistAuth = config.persistAuth !== false;
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // Verify token on mount
  useEffect(() => {
    const verifyStoredToken = async () => {
      if (!persistAuth || typeof window === 'undefined') {
        setIsVerifying(false);
        return;
      }

      const storedToken = localStorage.getItem(storageKey);
      if (!storedToken) {
        setIsVerifying(false);
        return;
      }

      // Verify token with server
      try {
        const apiEndpoint = config.apiEndpoint || '/api/auth/verify';
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: storedToken }),
        });

        const data = await response.json();
        if (data.success && data.valid) {
          setIsAuthenticated(true);
        } else {
          // Token invalid or expired, remove it
          localStorage.removeItem(storageKey);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem(storageKey);
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyStoredToken();
  }, [persistAuth, storageKey, config.apiEndpoint]);

  const authenticate = async (password: string): Promise<boolean> => {
    // If password is provided in config (legacy mode), use client-side validation
    // Otherwise, use server-side validation via API
    if (config.password) {
      // Client-side validation (less secure - password visible in bundle)
      // Note: This mode doesn't use tokens, so localStorage can be manually set
      // For better security, use server-side validation instead
      if (password === config.password) {
        if (persistAuth && typeof window !== 'undefined') {
          // Store a simple flag (less secure, but consistent with legacy mode)
          localStorage.setItem(storageKey, 'authenticated');
        }
        setIsAuthenticated(true);
        config.onSuccess?.();
        return true;
      } else {
        config.onError?.();
        return false;
      }
    } else {
      // Server-side validation (more secure - password never exposed)
      try {
        const apiEndpoint = config.apiEndpoint || '/api/auth/verify';
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
          // Store the secure token (not just "authenticated")
          if (persistAuth && typeof window !== 'undefined') {
            localStorage.setItem(storageKey, data.token);
          }
          setIsAuthenticated(true);
          config.onSuccess?.();
          return true;
        } else {
          config.onError?.();
          return false;
        }
      } catch (error) {
        console.error('Authentication error:', error);
        config.onError?.();
        return false;
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (persistAuth && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--background, #ffffff)' }}
      >
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: 'var(--foreground, #171717)' }}
          />
          <p 
            className="mt-4 opacity-70"
            style={{ color: 'var(--foreground, #171717)' }}
          >
            Verifying...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PasswordProtectContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        logout,
        config,
      }}
    >
      {children}
    </PasswordProtectContext.Provider>
  );
}

