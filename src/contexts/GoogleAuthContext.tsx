import React, { createContext, useContext, useState, useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface GoogleAuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isSignedIn: boolean;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const initializeGoogleAuth = async () => {
    try {
      if (!window.google) {
        console.error('Google API not loaded');
        setIsLoading(false);
        return;
      }

      await new Promise((resolve) => {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        resolve(true);
      });

      // Check if user is already signed in
      const savedUser = localStorage.getItem('googleUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsSignedIn(true);
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decode the JWT token to get user info
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);
      
      const user: GoogleUser = {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      };

      setUser(user);
      setIsSignedIn(true);
      localStorage.setItem('googleUser', JSON.stringify(user));

      // Save to Google Sheets
      await saveToWaitlist(user);
    } catch (error) {
      console.error('Error handling credential response:', error);
    }
  };

  const saveToWaitlist = async (userData: GoogleUser) => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          profilePicture: userData.picture,
          source: 'waitlist_signup',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to waitlist');
      }

      console.log('Successfully saved to waitlist');
    } catch (error) {
      console.error('Error saving to waitlist:', error);
    }
  };

  const signIn = async () => {
    try {
      if (!window.google) {
        throw new Error('Google API not loaded');
      }

      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setIsSignedIn(false);
      localStorage.removeItem('googleUser');
      
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const value: GoogleAuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
    isSignedIn,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};