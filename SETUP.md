# Google OAuth + Google Sheets Setup Guide

This guide covers the setup for Google OAuth authentication and Google Sheets integration for the Lekhak AI waitlist feature.

## Overview

When users click "Join Waitlist", they:
1. Sign in with Google OAuth
2. Their details are automatically saved to your Google Sheet
3. They see a confirmation that they're on the waitlist

## Prerequisites

- Google account
- Google service account (you mentioned you already have this)
- Google Sheet ID (you mentioned you already have this)
- Vercel account for deployment

## Step 1: Verify Your Google Sheet Setup

1. Open your Google Sheet
2. Ensure it has these column headers in Row 1:
   - A1: `Email`
   - B1: `Name` 
   - C1: `Signup Date`
   - D1: `Source`
   - E1: `Profile Picture`

3. Make sure your service account email has **Editor** permissions:
   - Click "Share" on your Google Sheet
   - Add your service account email (format: `yourapp@project-id.iam.gserviceaccount.com`)
   - Set permission to "Editor"

## Step 2: Set Up Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Click "Create Credentials" → "OAuth client ID"
4. If needed, configure the consent screen:
   - Choose "External" user type
   - Fill in required fields (app name, user support email, etc.)
   - Add your email as a test user
5. For Application type, choose "Web application"
6. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://your-domain.vercel.app` (your production URL)
7. Click "Create" and copy the Client ID

## Step 3: Enable Required APIs

In Google Cloud Console, go to "APIs & Services" → "Library" and enable:
- Google Sheets API
- Google Identity Services (should be enabled by default)

## Step 4: Set Up Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```env
# Google OAuth Client ID (from Step 2)
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com

# Google Sheets Integration (you already have these)
GOOGLE_SHEET_ID=your-sheet-id-here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

### For Vercel Deployment

1. Go to your Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `VITE_GOOGLE_CLIENT_ID` | Your OAuth Client ID | From Step 2 |
| `GOOGLE_SHEET_ID` | Your Google Sheet ID | You already have this |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | You already have this |
| `GOOGLE_PRIVATE_KEY` | Your private key | Include the full key with headers |

**Important for GOOGLE_PRIVATE_KEY**: 
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- In Vercel, paste it exactly as it appears in your JSON file
- Don't add extra quotes or modify the formatting

## Step 5: Deploy Your Changes

```bash
# Commit your changes
git add .
git commit -m "Add Google OAuth and Sheets integration"
git push

# Vercel will automatically deploy
```

## Step 6: Test the Integration

1. Visit your deployed site (or run locally with `npm run dev`)
2. Click the "Join Waitlist" button
3. Complete Google OAuth sign-in
4. Check your Google Sheet - you should see a new row with:
   - User's email
   - User's name
   - Signup timestamp
   - Source (waitlist_signup)
   - Profile picture URL

## Features Included

✅ **Google OAuth Sign-in**: Users authenticate with their Google account  
✅ **Automatic Sheet Logging**: User data is saved to your Google Sheet  
✅ **Duplicate Prevention**: Same email won't be added twice  
✅ **Loading States**: Users see appropriate loading/success messages  
✅ **Error Handling**: Graceful error handling for API failures  
✅ **Responsive Design**: Works on all devices  

## File Structure

The implementation includes these new files:

```
src/
├── contexts/
│   └── GoogleAuthContext.tsx    # Google OAuth logic
├── components/
│   └── Hero.tsx                 # Updated with OAuth button
└── App.tsx                      # Updated with AuthProvider

api/
└── waitlist.js                  # Vercel API endpoint for Sheets
```

## Troubleshooting

### "Google API not loaded" error
- Check that `VITE_GOOGLE_CLIENT_ID` is set correctly
- Verify your domain is in authorized origins
- Clear browser cache and try again

### "Sheet access denied" error  
- Verify service account has Editor access to the sheet
- Check `GOOGLE_SHEET_ID` is correct
- Ensure Google Sheets API is enabled

### "Authentication failed" error
- Verify `GOOGLE_SERVICE_ACCOUNT_EMAIL` is correct
- Check `GOOGLE_PRIVATE_KEY` is properly formatted
- Make sure newlines are preserved in the private key

### Button stays in loading state
- Check browser console for errors
- Verify all environment variables are set
- Check Vercel Functions logs for API errors

### Duplicate entries in sheet
- The system prevents duplicates by email
- If you see duplicates, check the email comparison logic
- Clear localStorage to test fresh signups

## Security Notes

1. **Never commit sensitive keys**: The `.env.local` file is gitignored
2. **Service account permissions**: Only grant necessary permissions
3. **OAuth origins**: Only add trusted domains to authorized origins
4. **Rate limiting**: Consider adding rate limiting for production

## Next Steps (Optional Enhancements)

1. **Email notifications**: Get notified when someone joins the waitlist
2. **Admin dashboard**: Create a dashboard to view/manage waitlist
3. **Analytics**: Track signup conversion rates
4. **Email campaigns**: Send updates to waitlist users
5. **Waitlist position**: Show users their position in the waitlist

## Monitoring Your Waitlist

- **Google Sheets**: Direct access to all signups
- **Vercel Functions**: Monitor API performance and errors
- **Google Analytics**: Track button clicks and conversions

Your waitlist integration is now complete! Users can sign up with one click and you'll have all their data organized in your Google Sheet.