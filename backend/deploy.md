# 🚀 Production Deployment Guide

## Option 1: Deploy to Vercel (Fastest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from backend directory
```bash
cd backend
vercel --prod
```

### Step 4: Set Environment Variables in Vercel Dashboard
Go to your project in Vercel dashboard and add:

```
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

SECRET_KEY=your-super-secret-key-here
ALLOWED_ORIGINS=https://www.lekhakai.com,https://lekhakai.com
LOG_LEVEL=INFO
```

### Step 5: Update URLs after deployment
After Vercel gives you a URL (e.g., `https://your-backend.vercel.app`), update these variables:

```
PHONEPE_WEBHOOK_URL=https://your-backend.vercel.app/api/webhooks/phonepe
SUCCESS_URL=https://www.lekhakai.com/payment/success
FAILURE_URL=https://www.lekhakai.com/payment/failure
DOMAIN_NAME=your-backend.vercel.app
```

---

## Option 2: Deploy to Railway (Alternative)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Deploy
```bash
railway login
railway init
railway up
```

---

## Option 3: Deploy to DigitalOcean App Platform

### Step 1: Create app.yaml
```yaml
name: lekhak-ai-backend
services:
- name: api
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: PHONEPE_CLIENT_ID
    value: SU2510171830392364659919
  # ... add all other environment variables
```

---

## Post-Deployment Steps

### 1. Test the deployed API
```bash
curl https://your-backend-url.vercel.app/api/health
```

### 2. Update frontend API URL
In your React app, update the API base URL to point to your deployed backend.

### 3. Test PhonePe payment
```bash
curl -X POST "https://your-backend-url.vercel.app/api/phonepe/create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "production_test_user",
    "plan_id": "test_plan",
    "amount": 5.0,
    "plan_name": "Production Test"
  }'
```

### 4. Update PhonePe webhook URL
Contact PhonePe support to update your webhook URL to the new production URL.

---

## Domain Setup (Optional)

To use `api.lekhakai.com` instead of Vercel's URL:

### 1. Add custom domain in Vercel
- Go to your project settings
- Add domain: `api.lekhakai.com`

### 2. Update DNS records
Add a CNAME record pointing `api.lekhakai.com` to your Vercel deployment.

### 3. Update all URLs
```
PHONEPE_WEBHOOK_URL=https://api.lekhakai.com/api/webhooks/phonepe
DOMAIN_NAME=api.lekhakai.com
```