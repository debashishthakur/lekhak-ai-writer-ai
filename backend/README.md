# Lekhak AI PhonePe Payment Integration

Production-ready PhonePe payment gateway integration for Lekhak AI subscription system.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL database
- PhonePe merchant account with production credentials

### Installation

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

5. **Run the application**
```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🔧 Configuration

### Environment Variables

```env
# PhonePe Production Credentials
PHONEPE_CLIENT_ID=SU2510171830392364659919
PHONEPE_CLIENT_SECRET=1d78344e-3e89-4fab-a36f-91e240601048
PHONEPE_MERCHANT_ID=M23KOSLLD1YQ2
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=PRODUCTION

# Webhook Configuration
PHONEPE_WEBHOOK_USERNAME=debashish
PHONEPE_WEBHOOK_PASSWORD=may211999
PHONEPE_WEBHOOK_URL=https://www.lekhakai.com/api/webhooks/phonepe

# Database
DATABASE_URL=postgresql://user:password@localhost/lekhakai

# Security
SECRET_KEY=your-super-secret-key
ALLOWED_ORIGINS=https://www.lekhakai.com,https://lekhakai.com
```

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Payment Operations
```
POST /api/phonepe/create-payment
GET  /api/phonepe/verify-payment/{order_id}
GET  /api/phonepe/order-status/{order_id}
POST /api/phonepe/refund
```

### Webhook
```
POST /api/webhooks/phonepe
```

### Service Info
```
GET /api/phonepe/service-info
```

## 🔐 Security Features

- **OAuth Token Management**: Automatic token refresh
- **Webhook Signature Verification**: SHA256 verification
- **CORS Protection**: Configured origins only
- **Request Validation**: Pydantic models
- **Error Handling**: Comprehensive error responses
- **Logging**: Detailed request/response logging

## 🎯 Supported Webhook Events

The system handles all PhonePe webhook events:

**Payment Events:**
- `checkout.order.completed`
- `checkout.order.failed`
- `pg.order.completed`
- `pg.order.failed`

**Refund Events:**
- `pg.refund.completed`
- `pg.refund.failed`
- `pg.refund.accepted`

**Settlement Events:**
- `settlement.initiated`
- `settlement.attempt.failed`

**Subscription Events:**
- `subscription.paused`
- `subscription.cancelled`
- `subscription.revoked`

**Dispute Events:**
- `payment.dispute.created`
- `payment.dispute.under_review`

**Paylink Events:**
- `paylink.order.completed`
- `paylink.order.failed`

## 🧪 Testing

### Test Credentials Validation
```bash
python services/phonepe_auth.py
```

### Test Payment Service
```bash
python services/phonepe_payment.py
```

### Test Webhook Handler
```bash
python services/phonepe_webhook.py
```

### Run API Tests
```bash
pytest tests/
```

## 📝 Usage Examples

### Create Payment
```bash
curl -X POST "http://localhost:8000/api/phonepe/create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "plan_id": "pro_plan",
    "amount": 399.0,
    "plan_name": "Pro"
  }'
```

### Check Payment Status
```bash
curl "http://localhost:8000/api/phonepe/verify-payment/LEKHAK_user123_1234567890"
```

### Process Refund
```bash
curl -X POST "http://localhost:8000/api/phonepe/refund" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_order_id": "LEKHAK_user123_1234567890",
    "amount": 399.0,
    "reason": "Customer request"
  }'
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Webhook URL accessible
- [ ] Health check endpoint responsive
- [ ] Logging configured
- [ ] Monitoring setup

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Service Information
```bash
curl http://localhost:8000/api/phonepe/service-info
```

### Logs
```bash
tail -f logs/phonepe.log
```

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failure**
   - Verify PhonePe credentials
   - Check token expiration
   - Validate environment configuration

2. **Webhook Verification Failed**
   - Check webhook username/password
   - Verify signature calculation
   - Ensure HTTPS for webhook URL

3. **Payment Creation Failed**
   - Validate request parameters
   - Check network connectivity
   - Review PhonePe API limits

## 📞 Support

- **Email**: support@lekhakai.com
- **Documentation**: `/api/docs`
- **Health Check**: `/api/health`

## 🔄 Version History

**v1.0.0** - Initial production release
- Complete PhonePe integration
- All webhook events supported
- Production-ready security
- Comprehensive error handling