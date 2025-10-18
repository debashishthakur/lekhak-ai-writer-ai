#!/bin/bash

# Test ₹5 payment with ngrok webhook URL
# Run this after setting up ngrok

echo "🚀 Testing ₹5 Payment with ngrok webhook"
echo "========================================="

# Check if ngrok URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your ngrok URL"
    echo "Usage: ./test_with_ngrok.sh https://your-ngrok-url.ngrok.io"
    echo ""
    echo "Steps:"
    echo "1. Start ngrok: ngrok http 8001"
    echo "2. Copy the HTTPS URL from ngrok"
    echo "3. Run: ./test_with_ngrok.sh https://your-url.ngrok.io"
    exit 1
fi

NGROK_URL=$1

echo "📡 Testing webhook accessibility..."
curl -X POST "$NGROK_URL/api/webhooks/phonepe" \
    -H "Content-Type: application/json" \
    -d '{"test": "webhook"}' \
    -w "\nStatus Code: %{http_code}\n"

echo ""
echo "💰 Creating ₹5 test payment..."
curl -X POST "http://localhost:8001/api/phonepe/create-payment" \
    -H "Content-Type: application/json" \
    -d '{
        "user_id": "debashish_ngrok_test",
        "plan_id": "test_plan",
        "amount": 5.0,
        "plan_name": "₹5 Test Plan"
    }' \
    -w "\nStatus Code: %{http_code}\n"

echo ""
echo "✅ Test completed!"
echo "💡 If payment creation succeeds, you'll get a payment token and URL"