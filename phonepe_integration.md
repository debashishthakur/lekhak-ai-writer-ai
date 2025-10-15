# PhonePe Payment Gateway Integration Plan

## Overview
This document outlines the complete plan for integrating PhonePe Payment Gateway into Lekhak AI's subscription system. The integration will handle Pro (₹399/month) and Unlimited (₹1599/month) plan subscriptions with automatic quota management for the Indian market.

## Prerequisites & Account Setup

### 1. PhonePe Merchant Account Creation
- **Account Type**: Business merchant account (PhonePe for Business)
- **Required Information**:
  - Business name: "Lekhak AI" 
  - Business type: Software/Technology/SaaS
  - Business PAN card
  - GST registration number (if applicable)
  - Business address and contact details
  - Website: https://www.lekhakai.com

### 2. Bank Account & Settlement Setup
- **Required**: Indian business bank account for receiving settlements
- **Settlement Cycle**: T+1 business day (faster than most gateways)
- **Supported Banks**: All major Indian banks (HDFC, ICICI, SBI, Axis, etc.)
- **Currency**: INR (Indian Rupees)

### 3. Card Requirements (Your Debit Card)
**✅ Mastercard Debit Card WILL WORK** for:
- Account verification during setup
- Testing payments in UAT mode
- Personal transactions

**For Business Operations**:
- PhonePe handles **incoming payments** from customers
- Transaction fees: 1.99% for all payment methods
- UPI transactions: 0% fee (government mandate) - **PhonePe's biggest advantage**

### 4. KYC & Documentation
- **Business Documents**:
  - Certificate of Incorporation/Partnership deed
  - PAN card (business)
  - GST certificate (if applicable)
  - Bank account proof (cancelled cheque/bank statement)
- **Individual KYC**:
  - Director/Partner PAN card
  - Aadhaar card
  - Address proof
- **Timeline**: 1-3 business days for verification (faster than Paytm)

### 5. Pricing for Indian Market
- **Free Plan**: 7 uses per day (unchanged)
- **Pro Plan**: ₹399/month (~$4.80) - 1000 uses per month
- **Unlimited Plan**: ₹1599/month (~$19.20) - Unlimited uses

## Technical Integration Plan

### Phase 1: PhonePe Setup & Configuration

#### 1.1 Install Dependencies
```bash
npm install crypto
# PhonePe uses standard crypto for checksums, no special SDK needed
```

#### 1.2 Environment Variables
Add to `.env.local` and Vercel:
```
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_HOST_URL=https://api-preprod.phonepe.com/apis/pg-sandbox  # UAT
PHONEPE_REDIRECT_URL=https://www.lekhakai.com/payment/success
PHONEPE_CALLBACK_URL=https://www.lekhakai.com/api/phonepe/callback
```

#### 1.3 Update Database Schema
```sql
-- Update subscription plans for Indian pricing
UPDATE subscription_plans SET 
  price_monthly = 399.00, 
  price_yearly = 3999.00,
  phonepe_plan_id = 'PLAN_PRO_MONTHLY'
WHERE name = 'Pro';

UPDATE subscription_plans SET 
  price_monthly = 1599.00, 
  price_yearly = 15999.00,
  phonepe_plan_id = 'PLAN_UNLIMITED_MONTHLY'
WHERE name = 'Unlimited';

-- Add new columns for PhonePe integration
ALTER TABLE subscription_plans ADD COLUMN phonepe_plan_id VARCHAR(100);
ALTER TABLE user_subscriptions ADD COLUMN phonepe_transaction_id VARCHAR(255);
ALTER TABLE payment_transactions ADD COLUMN phonepe_transaction_id VARCHAR(255);
ALTER TABLE payment_transactions ADD COLUMN phonepe_merchant_transaction_id VARCHAR(255);
```

### Phase 2: PhonePe Payment Architecture

#### 2.1 PhonePe Payment Process
1. **Initiate Payment**: Create transaction with PhonePe API
2. **Generate Checksum**: SHA256 hash with salt key
3. **Redirect to PhonePe**: User completes payment
4. **Callback Response**: PhonePe sends POST to callback URL
5. **Verify Transaction**: Server-to-server status check
6. **Activate Subscription**: Update database and quota

#### 2.2 PhonePe API Flow
```javascript
// 1. Create payment request
const paymentRequest = {
  merchantId: PHONEPE_MERCHANT_ID,
  merchantTransactionId: uniqueTransactionId,
  merchantUserId: userId,
  amount: amountInPaise, // ₹399 = 39900 paise
  redirectUrl: PHONEPE_REDIRECT_URL,
  callbackUrl: PHONEPE_CALLBACK_URL,
  paymentInstrument: {
    type: "PAY_PAGE"
  }
}

// 2. Generate checksum
const base64Request = Buffer.from(JSON.stringify(paymentRequest)).toString('base64')
const checksum = sha256(base64Request + '/pg/v1/pay' + saltKey) + '###' + saltIndex

// 3. Make API call to PhonePe
```

### Phase 3: Frontend Payment Flow

#### 3.1 Checkout Page (`/checkout`)
- **Route**: `/checkout?plan=pro&billing=monthly&extension_id=xxx`
- **Components**:
  - Plan summary in INR
  - PhonePe payment button
  - Payment options display
  - GST calculation (18% on services)
  - Terms & conditions

#### 3.2 Payment Success/Failure Pages
- **Success**: `/payment/success?transactionId=xxx`
- **Failure**: `/payment/failure?transactionId=xxx`
- **Features**:
  - Transaction verification
  - Subscription activation
  - Receipt generation
  - Extension activation link

#### 3.3 Subscription Management
- **Manual Renewal System**: Custom billing portal
- **Payment History**: Show past transactions
- **Download Invoices**: GST-compliant invoices
- **Renewal Reminders**: Email notifications

### Phase 4: Backend API Endpoints

#### 4.1 Initiate Payment
**Endpoint**: `POST /api/phonepe/initiate-payment`
```javascript
// Creates PhonePe transaction
// Generates checksum
// Returns payment URL for redirection
// Stores transaction in database
```

#### 4.2 Payment Callback
**Endpoint**: `POST /api/phonepe/callback`
```javascript
// Receives PhonePe callback
// Verifies checksum
// Calls status API for confirmation
// Activates subscription
// Updates user quotas
```

#### 4.3 Transaction Status Check
**Endpoint**: `GET /api/phonepe/check-status/:transactionId`
```javascript
// Server-to-server status verification
// Double-check payment status
// Handle edge cases and delays
```

#### 4.4 Subscription Renewal
**Endpoint**: `POST /api/phonepe/renew-subscription`
```javascript
// Handle manual renewals
// Create new payment for renewal
// Extend subscription period
```

### Phase 5: Security & Compliance

#### 5.1 Checksum Verification
```javascript
// Verify incoming callbacks
const receivedChecksum = req.headers['x-verify']
const calculatedChecksum = sha256(responseBody + saltKey) + '###' + saltIndex
if (receivedChecksum === calculatedChecksum) {
  // Process payment
}
```

#### 5.2 GST Compliance
- Calculate 18% GST on all transactions
- Generate GST-compliant invoices
- Maintain transaction records for auditing
- HSN code for software services: 998314

#### 5.3 Data Security
- Store minimal payment data
- Use HTTPS for all payment flows
- Implement proper logging and monitoring
- PCI DSS compliance through PhonePe

## File Structure

```
├── api/
│   └── phonepe/
│       ├── initiate-payment.js
│       ├── callback.js
│       ├── check-status.js
│       └── renew-subscription.js
├── src/
│   ├── components/
│   │   ├── checkout/
│   │   │   ├── PhonePeCheckout.tsx
│   │   │   ├── PlanSelector.tsx
│   │   │   └── GSTCalculator.tsx
│   │   └── billing/
│   │       ├── BillingHistory.tsx
│   │       ├── RenewalReminder.tsx
│   │       └── InvoiceDownload.tsx
│   ├── pages/
│   │   ├── Checkout.tsx
│   │   ├── PaymentSuccess.tsx
│   │   └── PaymentFailure.tsx
│   └── lib/
│       ├── phonepe.js (checksum utilities)
│       ├── gst.js (GST calculations)
│       └── invoice-generator.js
```

## Testing Strategy

### 1. UAT Environment
- Use PhonePe UAT/sandbox credentials
- Test all payment scenarios
- Verify callback handling

### 2. Test Scenarios
- **Successful payments**: All payment methods
- **Failed payments**: Declined, insufficient funds
- **Network issues**: Timeout handling, retry logic
- **Edge cases**: Duplicate transactions, callback delays

### 3. Test Payment Methods
- **Test Amount**: Use ₹1 for successful test transactions
- **UPI**: Test UPI IDs provided by PhonePe
- **Cards**: Use test card numbers from PhonePe documentation
- **Net Banking**: Test with PhonePe test banks

### 4. Callback Testing
```bash
# Test callback endpoint
curl -X POST https://www.lekhakai.com/api/phonepe/callback \
  -H "Content-Type: application/json" \
  -H "X-VERIFY: checksum" \
  -d '{"response": "base64_encoded_response"}'
```

## Cost Analysis

### PhonePe Transaction Fees
- **All Payment Methods**: 1.99% per transaction (competitive rate)
- **UPI**: 0% (government mandate)
- **Setup Fee**: ₹0 (free setup)
- **Annual Fee**: ₹0 (no annual charges)
- **Settlement**: T+1 (fastest in industry)

### Revenue Calculation (with 18% GST)
**Pro Plan (₹399/month)**:
- Base amount: ₹338.14
- GST (18%): ₹60.86
- Total: ₹399
- PhonePe fee (1.99%): ₹7.94
- Net revenue: ₹330.20 per month

**Unlimited Plan (₹1599/month)**:
- Base amount: ₹1355.08
- GST (18%): ₹243.92
- Total: ₹1599
- PhonePe fee (1.99%): ₹31.82
- Net revenue: ₹1323.26 per month

### UPI Advantage
- **0% fee on UPI transactions**
- Higher profit margins when customers use UPI
- Encourage UPI usage through UI/UX

## Launch Checklist

### Pre-Launch
- [ ] PhonePe merchant account verified
- [ ] Bank account connected for settlements
- [ ] Test all payment flows in UAT
- [ ] Set up callback URL handling
- [ ] Configure GST calculations
- [ ] Create invoice generation system
- [ ] Test checksum generation/verification

### Go-Live
- [ ] Switch to production PhonePe URLs
- [ ] Update environment variables
- [ ] Test with real ₹1 payment
- [ ] Monitor callback delivery
- [ ] Set up transaction monitoring
- [ ] Verify settlement in bank account

### Post-Launch
- [ ] Monitor transaction success rates
- [ ] Track UPI vs other payment methods
- [ ] Set up automated renewal reminders
- [ ] Implement customer support flows
- [ ] Prepare for GST filing

## PhonePe Advantages Over Paytm

### 1. **Faster Settlements**
- T+1 vs T+2 (Paytm)
- Better cash flow management

### 2. **Lower Fees**
- Flat 1.99% vs variable pricing
- Transparent fee structure

### 3. **Better UPI Integration**
- Owned by Walmart/Flipkart
- Largest UPI market share in India
- Higher success rates

### 4. **Simpler Integration**
- REST API based
- Better documentation
- Faster support response

### 5. **Higher Trust**
- Backed by Flipkart/Walmart
- Better brand recognition
- Higher payment success rates

## Manual Renewal System

### 1. Renewal Notifications
- **Email Reminders**: 7 days, 3 days, 1 day before expiry
- **In-Extension Notifications**: Show renewal prompts
- **WhatsApp Notifications**: Via PhonePe integration
- **Grace Period**: 3 days after expiry

### 2. Renewal Process Flow
```
1. User clicks "Renew Subscription"
2. Redirected to PhonePe payment page
3. Complete payment via preferred method
4. Callback received and verified
5. Subscription extended automatically
6. User quotas updated immediately
```

### 3. Renewal Tracking
```sql
-- Enhanced subscription renewals tracking
CREATE TABLE subscription_renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  old_subscription_id UUID REFERENCES user_subscriptions(id),
  new_subscription_id UUID REFERENCES user_subscriptions(id),
  renewal_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  phonepe_transaction_id VARCHAR(255),
  renewal_type VARCHAR(50) DEFAULT 'manual', -- manual, auto (future)
  discount_applied DECIMAL(5,2) DEFAULT 0.00
);
```

## Risk Mitigation

### 1. Payment Failures
- Implement smart retry mechanism
- Multiple payment method options
- Clear error messaging
- Customer support integration

### 2. Technical Issues
- Robust callback handling with retries
- Comprehensive error logging
- Manual transaction verification tools
- Monitoring and alerting system

### 3. Business Risks
- Diversified payment methods
- Backup payment gateway (Razorpay)
- Revenue forecasting and tracking
- Customer retention strategies

## Customer Support Integration

### Payment Issues
- Real-time transaction status lookup
- Failed payment retry mechanisms
- Refund processing automation
- GST invoice regeneration

### Technical Support
- Integration health monitoring
- API response time tracking
- Error rate monitoring
- Proactive issue detection

## Success Metrics & Analytics

### Key Performance Indicators
- **Payment Success Rate**: >95% target
- **UPI Adoption Rate**: Track UPI vs other methods
- **Average Transaction Value**: Monitor pricing effectiveness
- **Customer Lifetime Value**: Revenue per subscriber
- **Renewal Rate**: Manual renewal completion rate
- **Settlement Time**: Actual vs expected T+1

### Analytics Dashboard
```javascript
// Track key metrics
const metrics = {
  totalTransactions: count,
  successRate: (successful / total) * 100,
  upiPercentage: (upiTransactions / total) * 100,
  averageTicketSize: totalRevenue / totalTransactions,
  monthlyRecurringRevenue: activeSubs * avgPlanPrice
}
```

---

## Next Steps

1. **PhonePe Merchant Registration**
   - Visit: https://business.phonepe.com/
   - Complete business onboarding
   - Submit required documents

2. **Account Verification**
   - Complete KYC process
   - Bank account verification
   - Test API credentials setup

3. **Development Phase**
   - Set up UAT environment
   - Implement API endpoints
   - Build frontend components
   - Test callback mechanisms

4. **Testing & Deployment**
   - Comprehensive UAT testing
   - Security audit
   - Performance testing
   - Production deployment

**Timeline Estimate**: 2-3 weeks for complete integration including testing and deployment.

---

## Important Notes

### PhonePe vs Other Gateways

| Feature | PhonePe | Paytm | Razorpay |
|---------|---------|--------|----------|
| Transaction Fee | 1.99% | 1.99% | 2% |
| UPI Fee | 0% | 0% | 0% |
| Settlement | T+1 | T+2 | T+2 |
| Setup Fee | ₹0 | ₹0 | ₹0 |
| Market Share | #1 in UPI | #2 | #3 |
| Integration | Simple | Medium | Complex |

### Why PhonePe is Ideal for Lekhak AI

1. **Highest UPI Market Share**: 48% of UPI transactions
2. **Fastest Settlements**: T+1 cash flow advantage
3. **Simple Integration**: REST API, good documentation
4. **Better Success Rates**: Especially for UPI payments
5. **Cost Effective**: Competitive fees, no hidden charges
6. **Trust Factor**: Flipkart/Walmart backing increases user confidence

---

*This integration will provide the most efficient payment system for the Indian market with emphasis on UPI payments while maintaining competitive transaction fees and fastest settlement times.*