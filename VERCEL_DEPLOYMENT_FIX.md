# Fix for Google Sheets Waitlist Integration on Vercel

## 🚨 Problem
The waitlist functionality works locally but fails in production because the `/api/waitlist` endpoint can't access Google Sheets due to missing environment variables in Vercel.

## ✅ Solution: Configure Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and log in
2. Select your project: `lekhak-ai-writer-ai`
3. Click on the **Settings** tab
4. Navigate to **Environment Variables** section

### Step 2: Add Required Environment Variables
Add these 4 environment variables exactly as shown:

| Variable Name | Value (from your .env.local) |
|---------------|-------------------------------|
| `VITE_GOOGLE_CLIENT_ID` | `263567402021-314rh98f0ch0pgogplukug3i4an31b8e.apps.googleusercontent.com` |
| `GOOGLE_SHEET_ID` | `138uRZkM_5LlCqbuRtarXCfGSyL8h4D4z3vjqEzex5hw` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `lekhak-ai@lekhak-474618.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Copy the entire private key including the quotes and line breaks |

#### ⚠️ Important for GOOGLE_PRIVATE_KEY:
Copy the **entire** private key value from your `.env.local` file including the quotes:
```
"-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCghMkiLOJncp8D
vWu7cJi7oMsvDXz3dsTAa0rsw61Ek4pwFnhIFDTgzBr4WzETjxUXjK0PoL2p+ViJ
7lG+M+waQ2PoG3HFsqqU/D0fURDSag5SubQIag+j++V3E9TRPldTaRsq3UTlFHn0
64F5lJQqfnNuwL6VO8s9rIQjftGtFLu/Aiqc7ePRal+B2iGCv5C0IvA5aCa0t7sf
2HJZCgzNnr5loQwgpeiO6VGTjhOIMnwCg3wN1AFZn1Zbbf8jlyc380exVAAJVYpF
CqkQbxe/9YdheW9KZjPzrXyRBTKGDCXWYMUN7TwfUEnxVQWC+nLjDmQPLFoprKMU
nozMxqYjAgMBAAECggEAPd8Q2/BrEC65JirkFKqw5Fl1F9zeF1CbRAPXLG28Ipuw
F8ZBdJ79RszFdIdJ4l0bZyldJ5HwqUyoGPpYXbULw4/IOZYig257m9OiB6kqj8A7
Zx2XTEr9XlrgtsZZGJIr/MWdqCcDwDzlSUdhb6iad8qn2b/HdiRHEa2mfTwLu+eO
KaLKgdiX8Ta0uUURnG9ond+QPxQvb7bDmXE8D7bcaIzoCua7E/ddgfJ8ve/Ikydr
Ab+nayeBDXe6UmcsDATE06yKS0KoKdI5M1AtYPtnUvNst6BEwjuZBdnk3YxufJuK
bXz2G/BYbZU1wgrp2abRME3IiGZCZF64GT6AdFFA2QKBgQDcVCe/jtSmizXOdVmp
3aB51+z3Lw6YQwGE4WAYYm37EOFHl16oCbozyGE45lYVje0l6GHbgm9/nLTBoMbo
3aNMe6/4kVzTBJyFU27D1j1u8wsUTTmqKewL4g0RPaXHB0wwR0gXy8KdLadloVy+
XLN2yWftWraeXWjXOg2KvIVXVQKBgQC6gbdnL/8YY0Dmior/fSRO0YHd2p+eej4j
g5EYEj8TnjkLbPkr7cqp8vMq18wbvg2yrSGgHFUr8S49MEZ7tvNjy8O4R4J57ArC
9F8spstUzfuCPUXBZHQqJE4H9JMNpFPBijKYEaETaCw3rHpm8eWgi+8TrosrZkNT
TDckGymXlwKBgQCgq/4Qg2gvy3UBijJI3YYZVI1J9Nb/0l1ZOcGKBr2NSVH/kzND
91QCTy4XAGHmdglqi3xRR11oAi8OxOBJENf0/n3lFpxKhiJeV+l+hs1mC3cY5vgW
T1wDjmVZHUu3SGsXCeRY9g6F8LUSOAoaCCAXj+hp/q0N77B0w7D8a14RwQKBgQCI
SsrP6U8tbzq6PnwdAEJMJuYUTfNfSE2ofjjFsm/N0k41f0kHRRpY32W75T8O9u/j
polwC8Rh/DmiFWksdyGdyAYa4IcEue2TUilK5AiqzGwDXOtgzBvnv+gWADCGQ5PB
V1BpuFhRaksF1FEOca8wh5IKe/7PlEeW05doF0FpuQKBgAeJUZPeUUQK9ZdsewWZ
e2dMRu2WE9fGy9Sv+AQW7Zhvs4IHQa3R50fP/EKKdk9ax7K86IKXHHie2t9OsJhe
ivnTvjieHQPnpRU0MrEXq29fb5j0J0numf/156ihxIhXSrdgk6gMYICmjxXhXXXG
z2Qp+cbxwwVm7er4u34icBqf
-----END PRIVATE KEY-----"
```

### Step 3: Environment Selection
For each environment variable:
- **Production**: ✅ Check this
- **Preview**: ✅ Check this (optional but recommended)
- **Development**: ❌ Leave unchecked (you have .env.local for this)

### Step 4: Save and Redeploy
1. Click **Save** for each environment variable
2. Go to the **Deployments** tab
3. Click the **three dots (⋯)** on your latest deployment
4. Select **Redeploy**
5. Wait for the new deployment to complete

## 🧪 How to Test After Deployment

1. Visit your production URL (e.g., `your-app.vercel.app`)
2. Click **"Join Waitlist"**
3. Sign in with Google
4. Check your Google Sheet: [https://docs.google.com/spreadsheets/d/138uRZkM_5LlCqbuRtarXCfGSyL8h4D4z3vjqEzex5hw/edit](https://docs.google.com/spreadsheets/d/138uRZkM_5LlCqbuRtarXCfGSyL8h4D4z3vjqEzex5hw/edit)
5. You should see a new row with the user's data

## 🔧 Technical Details Fixed

- ✅ **googleapis dependency**: Added to package.json
- ✅ **API endpoint**: `/api/waitlist.js` exists and is correct
- ✅ **Environment variables**: Need to be configured in Vercel dashboard
- ✅ **Google Sheets permissions**: Service account has access to the sheet
- ✅ **OAuth configuration**: Client ID is correctly configured

## 🎯 Expected Result

After following these steps, when users click "Join Waitlist":
1. ✅ Google OAuth popup will appear
2. ✅ User signs in successfully  
3. ✅ Data gets sent to `/api/waitlist` endpoint
4. ✅ API authenticates with Google Sheets using service account
5. ✅ User data gets saved to your Google Sheet
6. ✅ User sees success message

The data will no longer fall back to localStorage and will properly reach your Google Sheets.