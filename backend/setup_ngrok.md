# 🌐 Setup ngrok for PhonePe Testing

## Install ngrok
```bash
# Install ngrok
brew install ngrok

# Or download from https://ngrok.com/download
```

## Setup ngrok tunnel
```bash
# In one terminal, start your backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# In another terminal, create public tunnel
ngrok http 8001
```

## Update webhook URL
Once ngrok starts, it will give you a public URL like:
```
https://abcd1234.ngrok.io
```

Update your .env file:
```env
PHONEPE_WEBHOOK_URL=https://abcd1234.ngrok.io/api/webhooks/phonepe
SUCCESS_URL=https://abcd1234.ngrok.io/payment/success
FAILURE_URL=https://abcd1234.ngrok.io/payment/failure
```

## Test payment again
```bash
curl -X POST "http://localhost:8001/api/phonepe/create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "debashish_test_user",
    "plan_id": "test_plan", 
    "amount": 5.0,
    "plan_name": "Test Plan"
  }'
```

This will make your webhook accessible to PhonePe and might resolve the issue.