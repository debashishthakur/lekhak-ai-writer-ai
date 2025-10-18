# 🚀 Lekhak AI - PhonePe Payment Integration

A complete AI writing assistant with PhonePe payment gateway integration for the Indian market.

## 🎯 Features

- **AI Writing Assistant**: Advanced text rewriting and grammar checking
- **PhonePe Payments**: Complete payment gateway integration for Indian users
- **Subscription Management**: Free, Pro (₹399), and Unlimited (₹1599) plans
- **Real-time Processing**: Fast API responses with subscription-based quotas
- **Secure Webhooks**: Complete PhonePe webhook handling for all events

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern React app with TypeScript
- Tailwind CSS for styling
- Responsive design with mobile support
- PhonePe checkout integration

### Backend (Python + FastAPI)
- FastAPI server with async support
- PhonePe OAuth token management
- Complete payment lifecycle handling
- Webhook processing for 16+ PhonePe events
- Supabase database integration

### Database (Supabase/PostgreSQL)
- User management and authentication
- Subscription and payment tracking
- Usage quotas and analytics
- Webhook event logging

## 🚀 Quick Deploy

### Automated Deployment
```bash
./deploy-to-vercel.sh
```

### Manual Deployment
See [DEPLOY_GITHUB_VERCEL.md](./DEPLOY_GITHUB_VERCEL.md) for detailed instructions.

## 📁 Project Structure

```
lekhak-ai-writer-ai/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/              # Page components
│   │   └── ...
├── backend/                    # Python FastAPI backend
│   ├── services/               # PhonePe integration services
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── vercel.json            # Vercel deployment config
└── README.md
```

## 🛠️ Development Setup

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Database
1. Run the SQL schema in your Supabase project
2. Update environment variables with your credentials

## 🔐 Environment Variables

### Backend (.env)
```env
# PhonePe Credentials
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_MERCHANT_ID=your_merchant_id

# Database
DATABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Webhook Configuration
PHONEPE_WEBHOOK_URL=https://your-domain.com/api/webhooks/phonepe
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=your_merchant_id
```

## 💰 Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free** | ₹0 | 7 uses per day |
| **Pro** | ₹399/month | 1000 uses per month |
| **Unlimited** | ₹1599/month | Unlimited usage |

## 🔧 API Endpoints

### Payment APIs
- `POST /api/phonepe/create-payment` - Create payment order
- `GET /api/phonepe/verify-payment/{order_id}` - Verify payment status
- `POST /api/webhooks/phonepe` - PhonePe webhook handler

### Utility APIs
- `GET /api/health` - Health check
- `GET /api/phonepe/service-info` - Service information
- `GET /api/subscription-plans` - Available plans

## 🧪 Testing

### Test ₹5 Payment
```bash
curl -X POST "https://your-backend.vercel.app/api/phonepe/create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "plan_id": "test_plan",
    "amount": 5.0,
    "plan_name": "Test Plan"
  }'
```

### Integration Testing
Open `backend/test_integration.html` in your browser for complete API testing.

## 📞 Support

- **PhonePe Integration**: All major payment methods (UPI, Cards, Net Banking, Wallets)
- **Error Handling**: Comprehensive error responses and logging
- **Security**: OAuth tokens, webhook signature verification, CORS protection

## 🚀 Deployment Status

- ✅ Backend ready for Vercel deployment
- ✅ Frontend components implemented
- ✅ Database schema deployed
- ✅ PhonePe integration complete
- ⏳ Webhook URL activation (requires PhonePe support)

## 📝 License

MIT License - See LICENSE file for details

---

**Ready for production deployment!** 

Follow the deployment guide in [DEPLOY_GITHUB_VERCEL.md](./DEPLOY_GITHUB_VERCEL.md) to go live.