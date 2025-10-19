import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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
    if (import.meta.env.DEV) {
      console.log('🚀 Initializing Google Auth...');
      console.log('🔑 Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    }
    
    try {
      if (!window.google) {
        console.error('❌ Google API not loaded');
        setIsLoading(false);
        return;
      }

      if (import.meta.env.DEV) {
        console.log('✅ Google API is available');
      }

      await new Promise((resolve) => {
        if (import.meta.env.DEV) {
          console.log('⚙️ Calling google.accounts.id.initialize...');
        }
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        if (import.meta.env.DEV) {
          console.log('✅ Google Auth initialized');
        }
        resolve(true);
      });

      // Check if user is already signed in
      const savedUser = localStorage.getItem('googleUser');
      if (savedUser) {
        if (import.meta.env.DEV) {
          console.log('👤 Found saved user in localStorage:', savedUser);
        }
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsSignedIn(true);
        if (import.meta.env.DEV) {
          console.log('✅ Restored user session');
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('ℹ️ No saved user found in localStorage');
        }
      }
    } catch (error) {
      console.error('💥 Error initializing Google Auth:', error);
    } finally {
      setIsLoading(false);
      if (import.meta.env.DEV) {
        console.log('✅ Google Auth initialization complete');
      }
    }
  };

  const handleCredentialResponse = useCallback(async (response: any) => {
    if (import.meta.env.DEV) {
      console.log('🔐 handleCredentialResponse called with:', response);
    }
    
    try {
      // Decode the JWT token to get user info
      if (import.meta.env.DEV) {
        console.log('🔑 Decoding JWT token...');
      }
      const token = response.credential;
      if (import.meta.env.DEV) {
        console.log('🔑 Token received (first 50 chars):', token?.substring(0, 50) + '...');
      }
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);
      if (import.meta.env.DEV) {
        console.log('👤 Decoded user data:', userData);
      }
      
      const user: GoogleUser = {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      };

      if (import.meta.env.DEV) {
        console.log('👤 Processed user object:', user);
      }

      setUser(user);
      setIsSignedIn(true);
      localStorage.setItem('googleUser', JSON.stringify(user));
      if (import.meta.env.DEV) {
        console.log('💾 User saved to localStorage');
      }

      // Remove the Google Sign-In popup if it exists
      const popup = document.getElementById('google-signin-button');
      if (popup) {
        document.body.removeChild(popup);
        if (import.meta.env.DEV) {
          console.log('🗑️ Removed Google Sign-In popup');
        }
      }

      // Save to Google Sheets
      if (import.meta.env.DEV) {
        console.log('📊 About to save to Google Sheets...');
      }
      await saveToWaitlist(user);
    } catch (error) {
      console.error('💥 Error handling credential response:', error);
      if (import.meta.env.DEV) {
        console.error('💥 Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }
  }, []);

  const saveToDevelopmentFallback = async (userData: GoogleUser) => {
    const signupDate = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Save to localStorage for development testing
    const existingData = JSON.parse(localStorage.getItem('lekhak-waitlist') || '[]');
    
    // Check for duplicates
    const emailExists = existingData.some((entry: any) => 
      entry.email.toLowerCase() === userData.email.toLowerCase()
    );
    
    if (emailExists) {
      if (import.meta.env.DEV) {
        console.log('⚠️ Email already exists in development waitlist');
      }
      return;
    }
    
    const newEntry = {
      email: userData.email,
      name: userData.name,
      profilePicture: userData.picture,
      source: 'waitlist_signup',
      signupDate,
      id: Date.now()
    };
    
    existingData.push(newEntry);
    localStorage.setItem('lekhak-waitlist', JSON.stringify(existingData));
    
    // Log the data in Google Sheets format
    if (import.meta.env.DEV) {
      console.log('🎉 NEW WAITLIST SIGNUP (DEVELOPMENT):');
      console.log('📧 Email:', userData.email);
      console.log('👤 Name:', userData.name);
      console.log('📅 Signup Date:', signupDate);
      console.log('🏷️ Source: waitlist_signup');
      console.log('🖼️ Profile Picture:', userData.picture);
      console.log('💾 Saved to localStorage for development testing');
      console.log('📊 Total waitlist entries:', existingData.length);
    }
    
    // Log in table format for easy copying to Google Sheets
    if (import.meta.env.DEV) {
      console.table([{
        Email: userData.email,
        Name: userData.name,
        'Signup Date': signupDate,
        Source: 'waitlist_signup',
        'Profile Picture': userData.picture
      }]);
      
      console.log('📋 To manually add to Google Sheets, copy this row:');
      console.log(`${userData.email}\t${userData.name}\t${signupDate}\twaitlist_signup\t${userData.picture}`);
    }
  };

  const saveToWaitlist = async (userData: GoogleUser) => {
    if (import.meta.env.DEV) {
      console.log('🚀 Starting saveToWaitlist with data:', userData);
    }
    
    try {
      const payload = {
        email: userData.email,
        name: userData.name,
        profilePicture: userData.picture,
        source: 'waitlist_signup',
      };
      
      console.log('📤 Sending payload to API:', payload);
      
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response ok:', response.ok);

      if (!response.ok) {
        // If it's a 404, it means we're in development mode and the API endpoint doesn't exist
        if (response.status === 404) {
          console.log('🛠️ API endpoint not found (development mode), using fallback...');
          return await saveToDevelopmentFallback(userData);
        }
        
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to save to waitlist: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Successfully saved to waitlist:', result);
    } catch (error) {
      console.error('💥 Error saving to waitlist:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Fallback to development mode on any error
      console.log('🛠️ Falling back to development mode...');
      await saveToDevelopmentFallback(userData);
    }
  };


  const signIn = useCallback(async () => {
    if (import.meta.env.DEV) {
      console.log('👆 Sign in button clicked');
      console.log('🌐 Current URL:', window.location.href);
      console.log('🏠 Current origin:', window.location.origin);
      console.log('🔑 Client ID being used:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    }
    
    try {
      if (!window.google) {
        console.error('❌ Google API not loaded');
        throw new Error('Google API not loaded');
      }

      console.log('✅ Google API available, using OAuth popup flow...');
      
      // Use OAuth popup flow instead of One Tap (more reliable)
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: handleTokenResponse,
      });
      
      console.log('🚀 Opening OAuth popup...');
      client.requestAccessToken();
      
    } catch (error) {
      console.error('💥 Error signing in:', error);
      // Fallback to One Tap if OAuth fails
      if (import.meta.env.DEV) {
        console.log('🔄 Falling back to One Tap...');
      }
      fallbackToOneTap();
    }
  }, []);

  const handleTokenResponse = async (response: any) => {
    console.log('🔐 Token response received:', response);
    
    if (response.access_token) {
      try {
        console.log('✅ Access token received, getting user info...');
        
        // Get user info using the access token
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${response.access_token}`,
          },
        });
        
        const userData = await userResponse.json();
        console.log('👤 User data received:', userData);
        
        const user: GoogleUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
        };

        setUser(user);
        setIsSignedIn(true);
        localStorage.setItem('googleUser', JSON.stringify(user));
        
        // Save to waitlist
        await saveToWaitlist(user);
      } catch (error) {
        console.error('💥 Error processing token response:', error);
      }
    } else {
      console.error('❌ No access token in response:', response);
    }
  };

  const fallbackToOneTap = () => {
    console.log('🔄 Trying One Tap as fallback...');
    
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
    });
    
    window.google.accounts.id.prompt((notification: any) => {
      console.log('🔔 One Tap notification:', notification);
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('⚠️ One Tap also failed, creating manual button...');
        createFallbackSignInButton();
      }
    });
  };

  const createFallbackSignInButton = () => {
    // Only create if it doesn't already exist
    if (document.getElementById('google-signin-button')) {
      return;
    }

    console.log('🔄 Creating fallback Google Sign-In button...');
    
    // Create a temporary container for the Google Sign-In button
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'google-signin-button';
    buttonContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 10px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    `;
    closeButton.onclick = () => {
      document.body.removeChild(buttonContainer);
    };
    
    buttonContainer.appendChild(closeButton);
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Sign in with Google';
    title.style.margin = '0 0 15px 0';
    buttonContainer.appendChild(title);
    
    document.body.appendChild(buttonContainer);
    
    // Render the Google Sign-In button
    window.google.accounts.id.renderButton(buttonContainer, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'rectangular',
      text: 'signin_with',
      logo_alignment: 'left',
      width: 250
    });
    
    console.log('✅ Fallback Google sign-in button created');
  };

  const signOut = useCallback(async () => {
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
  }, []);

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

  const value: GoogleAuthContextType = useMemo(() => ({
    user,
    isLoading,
    signIn,
    signOut,
    isSignedIn,
  }), [user, isLoading, signIn, signOut, isSignedIn]);

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};