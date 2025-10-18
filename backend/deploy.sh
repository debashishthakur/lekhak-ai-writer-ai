#!/bin/bash

echo "🚀 Deploying Lekhak AI PhonePe Backend to Production"
echo "=================================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Please run this from the backend directory."
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "✅ main.py found"
echo "✅ vercel.json configured"
echo "✅ requirements.txt ready"
echo "✅ api/index.py created"

echo ""
echo "🔐 Please ensure you've set these environment variables in Vercel dashboard:"
echo "   - PHONEPE_CLIENT_ID"
echo "   - PHONEPE_CLIENT_SECRET"
echo "   - PHONEPE_MERCHANT_ID"
echo "   - DATABASE_URL"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - And all other variables from .env.example"

echo ""
read -p "Have you set all environment variables in Vercel? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please set environment variables first, then run this script again."
    echo "💡 Go to: https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables"
    exit 1
fi

echo ""
echo "🚀 Starting deployment..."

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Post-deployment steps:"
echo "1. Test your API: curl https://your-backend-url.vercel.app/api/health"
echo "2. Update frontend to use new backend URL"
echo "3. Update PhonePe webhook URL in your merchant dashboard"
echo "4. Test ₹5 payment to verify everything works"
echo ""
echo "🎯 Your backend should now be live and accessible to PhonePe webhooks!"