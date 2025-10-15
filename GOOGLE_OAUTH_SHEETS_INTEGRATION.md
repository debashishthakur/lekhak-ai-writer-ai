# Google OAuth + Google Sheets Integration Guide

This document provides a complete implementation guide for integrating Google OAuth authentication with Google Sheets data capture in a React application. This system allows users to sign in with Google and automatically saves their information to a Google Sheet.

## 🏗️ System Architecture

```
User clicks "Sign Up" → Google OAuth Popup → User Authentication → 
Extract User Data → Send to API Endpoint → Save to Google Sheets
```

## 📋 Prerequisites

### 1. Google Cloud Project Setup
- Google Cloud Project with billing enabled
- Google Sheets API enabled
- Google Identity Services (OAuth 2.0) enabled

### 2. Required Services
- **Google Cloud Console**: For OAuth client configuration
- **Google Sheets**: For data storage
- **Deployment Platform**: Vercel/Netlify (for serverless functions)

## 🔧 Implementation Steps

### Step 1: Google Cloud Console Configuration

#### 1.1 Create OAuth 2.0 Credentials
```
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click "Create Credentials" → OAuth 2.0 Client IDs
3. Application type: Web application
4. Name: Your App Name
5. Authorized JavaScript origins:
   - http://localhost:8080 (development)
   - http://localhost:3000 (development)
   - https://your-domain.com (production)
6. Save and copy the Client ID
```

#### 1.2 Create Service Account (for Sheets API)
```
1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: sheets-service-account
4. Grant role: Editor (or custom Sheets permissions)
5. Create key → JSON format
6. Download and extract:
   - client_email
   - private_key
```

#### 1.3 Enable Required APIs
```
1. Go to APIs & Services → Library
2. Enable:
   - Google Sheets API
   - Google Identity Services API
```

### Step 2: Google Sheets Setup

#### 2.1 Create Target Spreadsheet
```
1. Create new Google Sheet
2. Set up columns: Email | Name | Signup Date | Source | Profile Picture
3. Copy Sheet ID from URL: 
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
```

#### 2.2 Grant Service Account Access
```
1. Open your Google Sheet
2. Click Share
3. Add service account email (from Step 1.2)
4. Grant Editor permissions
```

### Step 3: Environment Variables Setup

Create `.env.local` file:
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-oauth-client-id.apps.googleusercontent.com

# Google Sheets Integration
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
```

### Step 4: Frontend Implementation

#### 4.1 Install Dependencies
```bash
npm install @tanstack/react-query
```

#### 4.2 Create Google Auth Context

**File: `src/contexts/GoogleAuthContext.tsx`**

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define interfaces
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

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Initialize Google Auth on component mount
  const initializeGoogleAuth = async () => {
    try {
      if (!window.google) {
        console.error('Google API not loaded');
        setIsLoading(false);
        return;
      }

      // Check for existing user in localStorage
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

  // Handle OAuth token response
  const handleTokenResponse = async (response: any) => {
    if (response.access_token) {
      try {
        // Get user info using access token
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${response.access_token}`,
          },
        });
        
        const userData = await userResponse.json();
        
        const user: GoogleUser = {
          id: userData.id,
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
        console.error('Error processing token response:', error);
      }
    }
  };

  // Sign in with Google OAuth popup
  const signIn = async () => {
    try {
      if (!window.google) {
        throw new Error('Google API not loaded');
      }

      // Initialize OAuth client
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: handleTokenResponse,
      });
      
      // Request access token
      client.requestAccessToken();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Save user data to Google Sheets via API
  const saveToWaitlist = async (userData: GoogleUser) => {
    try {
      const payload = {
        email: userData.email,
        name: userData.name,
        profilePicture: userData.picture,
        source: 'waitlist_signup',
      };
      
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to save to waitlist: ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully saved to waitlist:', result);
    } catch (error) {
      console.error('Error saving to waitlist:', error);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setUser(null);
      setIsSignedIn(false);
      localStorage.removeItem('googleUser');
      
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    document.head.appendChild(script);

    return () => {
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
```

#### 4.3 Wrap App with Provider

**File: `src/App.tsx`**

```typescript
import { GoogleAuthProvider } from "@/contexts/GoogleAuthContext";

const App = () => (
  <GoogleAuthProvider>
    {/* Your app components */}
  </GoogleAuthProvider>
);

export default App;
```

#### 4.4 Use in Components

**Example usage in a component:**

```typescript
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";

const SignUpButton = () => {
  const { user, isSignedIn, signIn, isLoading } = useGoogleAuth();

  const handleSignUp = async () => {
    if (isSignedIn) return;
    
    try {
      await signIn();
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isSignedIn && user) {
    return <div>Welcome, {user.name}!</div>;
  }

  return (
    <button onClick={handleSignUp}>
      Sign Up with Google
    </button>
  );
};
```

### Step 5: Backend API Implementation

#### 5.1 Install Dependencies
```bash
npm install googleapis
```

#### 5.2 Create API Endpoint

**File: `api/waitlist.js` (for Vercel)**

```javascript
import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, profilePicture, source } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Set up Google Sheets authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get current timestamp
    const signupDate = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Prepare data for Google Sheets
    const values = [
      [
        email,
        name,
        signupDate,
        source || 'waitlist_signup',
        profilePicture || ''
      ]
    ];

    // Check for duplicate emails
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:A',
    });

    const existingEmails = existingData.data.values || [];
    const emailExists = existingEmails.some(row => 
      row[0]?.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return res.status(409).json({ 
        error: 'Email already exists in waitlist',
        message: 'This email is already registered for the waitlist.' 
      });
    }

    // Append data to Google Sheets
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log('Successfully added to waitlist:', { email, name, signupDate });

    return res.status(200).json({
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        email,
        name,
        signupDate,
        rowsAdded: response.data.updates.updatedRows
      }
    });

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    
    // Handle specific Google API errors
    if (error.code === 403) {
      return res.status(500).json({
        error: 'Google Sheets access denied',
        message: 'Please check that the service account has access to the spreadsheet'
      });
    }
    
    if (error.code === 404) {
      return res.status(500).json({
        error: 'Spreadsheet not found',
        message: 'Please check the GOOGLE_SHEET_ID environment variable'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add to waitlist. Please try again later.'
    });
  }
}
```

### Step 6: Deployment Configuration

#### 6.1 Vercel Deployment
```bash
# Deploy to Vercel
npm install -g vercel
vercel

# Or connect GitHub repo to Vercel dashboard
```

#### 6.2 Environment Variables in Production
Set these in your deployment platform (Vercel/Netlify):
```
VITE_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your-private-key
```

#### 6.3 Update OAuth Origins for Production
Add your production domain to Google Cloud Console OAuth settings:
```
https://your-app.vercel.app
```

## 🎯 Data Flow Summary

1. **User Interaction**: User clicks sign-up button
2. **OAuth Initiation**: Google OAuth popup opens
3. **Authentication**: User signs in with Google
4. **Token Exchange**: Access token received
5. **User Data Fetch**: Get user profile from Google
6. **API Call**: Send user data to `/api/waitlist`
7. **Authentication**: Service account authenticates with Google Sheets
8. **Data Validation**: Check for duplicate emails
9. **Data Storage**: Append user data to Google Sheet
10. **Response**: Success/error response to frontend

## 🔍 Troubleshooting Common Issues

### Issue: "Origin not allowed"
**Solution**: Add your domain to Google Cloud Console → OAuth 2.0 Client → Authorized JavaScript origins

### Issue: "Sheets access denied (403)"
**Solution**: Ensure service account has Editor access to the specific Google Sheet

### Issue: "API endpoint not found (404)"
**Solution**: Verify `/api/waitlist.js` is in correct directory for your deployment platform

### Issue: "Private key format error"
**Solution**: Ensure private key includes `\n` characters and is properly escaped in environment variables

## 📊 Expected Google Sheets Output

| Email | Name | Signup Date | Source | Profile Picture |
|-------|------|-------------|--------|----------------|
| user@example.com | John Doe | 12/25/2024, 10:30:45 AM | waitlist_signup | https://lh3.googleusercontent.com/... |

## 🔒 Security Considerations

1. **Never expose private keys** in frontend code
2. **Use HTTPS** for all production deployments
3. **Validate all inputs** on the backend
4. **Implement rate limiting** to prevent spam
5. **Use environment variables** for all sensitive data
6. **Regularly rotate** service account keys

## 🚀 Implementation Checklist

- [ ] Google Cloud project created
- [ ] OAuth 2.0 client configured
- [ ] Service account created with JSON key
- [ ] Google Sheets API enabled
- [ ] Target spreadsheet created and shared
- [ ] Environment variables configured
- [ ] Frontend context implemented
- [ ] Backend API endpoint created
- [ ] Production domains added to OAuth
- [ ] Application deployed
- [ ] End-to-end testing completed

This documentation provides everything needed to implement Google OAuth with Google Sheets integration in any React application. Simply follow the steps in order and adapt the component names/styling to match your project structure.