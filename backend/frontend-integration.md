# 🔗 Frontend Integration Guide

## Step 1: Update API Base URL

Create or update `src/config/api.ts`:

```typescript
// src/config/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.vercel.app'  // Replace with your actual backend URL
  : 'http://localhost:8001';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  CREATE_PAYMENT: `${API_BASE_URL}/api/phonepe/create-payment`,
  VERIFY_PAYMENT: `${API_BASE_URL}/api/phonepe/verify-payment`,
  SUBSCRIPTION_PLANS: `${API_BASE_URL}/api/subscription-plans`,
  SERVICE_INFO: `${API_BASE_URL}/api/phonepe/service-info`,
};

export default API_BASE_URL;
```

## Step 2: Update PhonePeCheckout Component

Update `src/components/PhonePeCheckout.tsx`:

```typescript
import { API_ENDPOINTS } from '../config/api';

// In the component, replace API calls:
const initiatePayment = async () => {
  try {
    setLoading(true);
    
    // Create payment order
    const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        plan_id: selectedPlan.id,
        amount: selectedPlan.price_monthly,
        plan_name: selectedPlan.name
      })
    });

    if (!response.ok) {
      throw new Error('Payment creation failed');
    }

    const paymentData = await response.json();
    
    // Use PhonePe's iframe integration
    const checkoutConfig = {
      tokenUrl: `${API_ENDPOINTS.VERIFY_PAYMENT}/${paymentData.merchant_order_id}`,
      callback: handlePaymentCallback,
      type: "IFRAME"
    };
    
    window.PhonePeCheckout.transact(checkoutConfig);
    
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Step 3: Add PhonePe Script to HTML

Add to your `public/index.html`:

```html
<script src="https://mercury.phonepe.com/web/bundle/checkout.js"></script>
```

## Step 4: Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=M23KOSLLD1YQ2
```

## Step 5: Update Payment Success/Failure Pages

Create `src/pages/payment/success.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_ENDPOINTS } from '../../config/api';

export default function PaymentSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (orderId) {
      verifyPayment(orderId as string);
    }
  }, [orderId]);

  const verifyPayment = async (orderIdb: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.VERIFY_PAYMENT}/${orderId}`);
      const data = await response.json();
      
      if (data.success && data.status === 'completed') {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="payment-result">
      {status === 'verifying' && <div>Verifying payment...</div>}
      {status === 'success' && (
        <div>
          <h1>Payment Successful! 🎉</h1>
          <p>Your subscription has been activated.</p>
        </div>
      )}
      {status === 'failed' && (
        <div>
          <h1>Payment Failed ❌</h1>
          <p>Please try again or contact support.</p>
        </div>
      )}
    </div>
  );
}
```

## Step 6: Test Integration

Create `src/utils/testPayment.ts`:

```typescript
import { API_ENDPOINTS } from '../config/api';

export const testPaymentIntegration = async () => {
  try {
    // Test health check
    const healthResponse = await fetch(API_ENDPOINTS.HEALTH);
    console.log('Health:', await healthResponse.json());

    // Test subscription plans
    const plansResponse = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLANS);
    console.log('Plans:', await plansResponse.json());

    // Test payment creation (with ₹5)
    const paymentResponse = await fetch(API_ENDPOINTS.CREATE_PAYMENT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'frontend_test_user',
        plan_id: 'test_plan',
        amount: 5.0,
        plan_name: 'Test Plan'
      })
    });
    
    console.log('Payment:', await paymentResponse.json());
    
  } catch (error) {
    console.error('Integration test failed:', error);
  }
};
```

## Step 7: Update CORS Settings

The backend is already configured to allow your domain. After deployment, verify CORS settings include your frontend domain.