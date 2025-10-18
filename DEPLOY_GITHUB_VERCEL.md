# 🚀 GitHub → Vercel Deployment Guide

## Step 1: Prepare Repository for Git

### Clean up sensitive files
```bash
# Make sure .env is not committed
rm backend/.env  # We'll set environment variables in Vercel instead
```

### Check what will be committed
```bash
git status
git add -A
git status  # Review files to be committed
```

## Step 2: Initialize Git and Push to GitHub

### Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "feat: Add PhonePe payment integration

- Complete FastAPI backend with PhonePe OAuth and payment APIs
- React frontend components for checkout flow
- Supabase database schema and integration
- Webhook handling for all PhonePe events
- Production-ready deployment configuration

🤖 Generated with Claude Code"
```

### Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `lekhak-ai-phonepe-integration` (or your preferred name)
3. Make it **Private** (contains sensitive business logic)
4. Don't initialize with README (we already have files)
5. Click "Create repository"

### Push to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/lekhak-ai-phonepe-integration.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy Backend to Vercel

### Connect GitHub to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Click "Import" next to your GitHub repository
4. **Important**: Set root directory to `backend` (not the main directory)

### Configure Vercel Project Settings
**Root Directory**: `backend`
**Framework Preset**: Other
**Build Command**: (leave empty)
**Output Directory**: (leave empty)

### Set Environment Variables in Vercel
Add these in Project Settings → Environment Variables:

```env
PHONEPE_CLIENT_ID=SU2510171830392364659919
PHONEPE_CLIENT_SECRET=1d78344e-3e89-4fab-a36f-91e240601048
PHONEPE_MERCHANT_ID=M23KOSLLD1YQ2
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=PRODUCTION

PHONEPE_AUTH_URL=https://api.phonepe.com/apis/identity-manager/v1/oauth/token
PHONEPE_CHECKOUT_URL=https://api.phonepe.com/apis/pg/checkout/v2/pay
PHONEPE_STATUS_URL=https://api.phonepe.com/apis/pg/checkout/v2/order
PHONEPE_REFUND_URL=https://api.phonepe.com/apis/pg/payments/v2/refund

PHONEPE_WEBHOOK_USERNAME=debashish
PHONEPE_WEBHOOK_PASSWORD=may211999

BUSINESS_NAME="Lekhak AI"
BUSINESS_EMAIL="legal@lekhakai.com"
BUSINESS_CONTACT="Mr. Debashish Thakur"

DATABASE_URL=postgresql://postgres:May211999supabase@db.bopgkrashywubimyivbd.supabase.co:5432/postgres
SUPABASE_URL=https://bopgkrashywubimyivbd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcGdrcmFzaHl3dWJpbXlpdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTM5NjIsImV4cCI6MjA3NTk4OTk2Mn0.kuYimtM68VU_WlYbxS2FGC9l7gJBQsiaXVJMy51cQJ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcGdrcmFzaHl3dWJpbXlpdmJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQxMzk2MiwiZXhwIjoyMDc1OTg5OTYyfQ.AjEjJETc63NLZRdmQ5bLRTGk6-3CI8dP15TLk3LsRxI

SECRET_KEY=lekhak-ai-phonepe-production-secret-2025
ALLOWED_ORIGINS=https://www.lekhakai.com,https://lekhakai.com
LOG_LEVEL=INFO
```

### Update Webhook URLs (After Deployment)
Once Vercel gives you a URL (e.g., `https://your-backend.vercel.app`), update these environment variables:

```env
PHONEPE_WEBHOOK_URL=https://your-backend.vercel.app/api/webhooks/phonepe
SUCCESS_URL=https://www.lekhakai.com/payment/success
FAILURE_URL=https://www.lekhakai.com/payment/failure
DOMAIN_NAME=your-backend.vercel.app
```

## Step 4: Test Deployed Backend

### Basic Health Check
```bash
curl https://your-backend.vercel.app/api/health
```

### Test PhonePe Service
```bash
curl https://your-backend.vercel.app/api/phonepe/service-info
```

### Test Payment Creation (₹5)
```bash
curl -X POST "https://your-backend.vercel.app/api/phonepe/create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "github_deploy_test",
    "plan_id": "test_plan",
    "amount": 5.0,
    "plan_name": "GitHub Deploy Test"
  }'
```

## Step 5: Update Frontend

### Option A: Update existing Vercel frontend
Update your frontend project's environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=M23KOSLLD1YQ2
```

### Option B: Deploy frontend separately
Deploy the frontend part of your repo to Vercel with root directory as `/` (main directory).

## Step 6: Contact PhonePe Support

### Update Webhook URL
Email: merchant.support@phonepe.com
Message template:
```
Subject: Webhook URL Update - Merchant ID: M23KOSLLD1YQ2

Dear PhonePe Support,

I need to update my webhook URL for merchant account M23KOSLLD1YQ2.

Old URL: https://www.lekhakai.com/api/webhooks/phonepe  
New URL: https://your-backend.vercel.app/api/webhooks/phonepe

Please update this in my merchant dashboard. The new URL is now publicly accessible and ready to receive webhook events.

Business: Lekhak AI
Contact: Mr. Debashish Thakur

Thank you!
```

## Step 7: Continuous Deployment

### Auto-deploy on Git push
- Every `git push` to main branch will trigger automatic deployment
- Monitor deployments in Vercel dashboard
- Check deployment logs for any issues

### Development workflow
```bash
# Make changes
git add .
git commit -m "feat: improve payment flow"
git push origin main
# Vercel automatically deploys
```

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Python version in `runtime.txt`
2. **Import errors**: Ensure all dependencies in `requirements.txt`
3. **Environment variables**: Verify all variables are set in Vercel
4. **CORS errors**: Check `ALLOWED_ORIGINS` includes frontend domain

### Debug Commands:
```bash
# Check Vercel deployment logs
vercel logs your-project-name

# Test specific endpoints
curl -v https://your-backend.vercel.app/api/health
```

## Success Criteria
- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Backend deployed to Vercel
- [ ] ✅ All environment variables set
- [ ] ✅ Health check passes
- [ ] ✅ PhonePe authentication works
- [ ] ✅ Webhook URL updated with PhonePe
- [ ] ✅ ₹5 test payment successful

🎯 **Ready for production payments!**