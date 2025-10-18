# ✅ Production Deployment Checklist

## Pre-Deployment
- [ ] All backend files ready (`main.py`, `vercel.json`, `requirements.txt`)
- [ ] Environment variables documented (see `.env.example`)
- [ ] Database schema deployed to Supabase
- [ ] PhonePe credentials tested locally

## Deployment Steps

### 1. Deploy Backend to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
cd backend
./deploy.sh
```

### 2. Set Environment Variables in Vercel
Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env.example`:
- [ ] `PHONEPE_CLIENT_ID`
- [ ] `PHONEPE_CLIENT_SECRET` 
- [ ] `PHONEPE_MERCHANT_ID`
- [ ] `DATABASE_URL`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] All other variables

### 3. Update Webhook URLs
After getting your backend URL (e.g., `https://your-backend.vercel.app`):

- [ ] Update `PHONEPE_WEBHOOK_URL` in Vercel env vars
- [ ] Update `SUCCESS_URL` and `FAILURE_URL` in Vercel env vars

### 4. Test Deployed Backend
```bash
# Test health check
curl https://your-backend.vercel.app/api/health

# Test PhonePe service info  
curl https://your-backend.vercel.app/api/phonepe/service-info

# Test payment creation
curl -X POST "https://your-backend.vercel.app/api/phonepe/create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "production_test",
    "plan_id": "test_plan", 
    "amount": 5.0,
    "plan_name": "Production Test"
  }'
```

### 5. Update Frontend
- [ ] Update API base URL in frontend config
- [ ] Add PhonePe script to HTML
- [ ] Update payment success/failure page URLs
- [ ] Test frontend → backend connectivity

### 6. Contact PhonePe Support
- [ ] Provide new webhook URL: `https://your-backend.vercel.app/api/webhooks/phonepe`
- [ ] Request webhook URL update in merchant dashboard
- [ ] Verify business account activation status

## Post-Deployment Verification

### Backend Health Check
- [ ] `/api/health` returns 200 with service status
- [ ] `/api/phonepe/service-info` shows correct merchant info
- [ ] PhonePe authentication working (token generation)
- [ ] Supabase connection working
- [ ] All environment variables loaded correctly

### Frontend Integration
- [ ] Frontend can call backend API endpoints
- [ ] Payment creation flow initiates correctly
- [ ] Success/failure pages work
- [ ] CORS allows frontend domain

### Payment Flow Test
- [ ] Create ₹5 test payment
- [ ] Verify webhook receives callbacks
- [ ] Payment verification works
- [ ] Database updates correctly
- [ ] User notifications work

## Production URLs

After deployment, update these:

**Backend:** `https://your-backend.vercel.app`
**Webhook:** `https://your-backend.vercel.app/api/webhooks/phonepe`
**Success:** `https://www.lekhakai.com/payment/success`
**Failure:** `https://www.lekhakai.com/payment/failure`

## Troubleshooting

### Common Issues:
1. **500 errors**: Check environment variables in Vercel
2. **CORS errors**: Verify `ALLOWED_ORIGINS` includes frontend domain
3. **PhonePe errors**: Ensure webhook URL is publicly accessible
4. **Database errors**: Check Supabase connection and credentials

### Debug Commands:
```bash
# Check deployment logs
vercel logs your-backend.vercel.app

# Test specific endpoints
curl -v https://your-backend.vercel.app/api/health
```

## Success Criteria
- [ ] ✅ Backend deployed and accessible
- [ ] ✅ PhonePe webhook URL updated
- [ ] ✅ Test payment of ₹5 successful
- [ ] ✅ Frontend integrated with backend
- [ ] ✅ End-to-end payment flow working

🎯 **Ready for production payments!**