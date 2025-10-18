import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

// Declare PhonePe global object
declare global {
  interface Window {
    PhonePeCheckout: {
      transact: (config: {
        tokenUrl: string;
        callback: (response: any) => void;
        type: string;
      }) => void;
      closePage: () => void;
    };
  }
}

interface PhonePeCheckoutProps {
  userId: string;
  planId: string;
  amount: number;
  planName: string;
  planFeatures: string[];
  onSuccess: (transactionId: string) => void;
  onFailure: (error: string) => void;
  onCancel?: () => void;
}

const PhonePeCheckout: React.FC<PhonePeCheckoutProps> = ({
  userId,
  planId,
  amount,
  planName,
  planFeatures,
  onSuccess,
  onFailure,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);

  // Calculate amounts
  const baseAmount = amount;
  const gstAmount = baseAmount * 0.18;
  const totalAmount = baseAmount + gstAmount;

  // Load PhonePe checkout script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://mercury.phonepe.com/web/bundle/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      console.log('PhonePe script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load PhonePe checkout script');
      toast.error('Failed to load payment gateway');
      onFailure('Failed to load payment gateway');
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Script might already be removed
      }
    };
  }, [onFailure]);

  const initiatePayment = async () => {
    if (!isScriptLoaded) {
      toast.error('Payment gateway not ready');
      onFailure('Payment gateway not ready');
      return;
    }

    setIsLoading(true);
    
    try {
      toast.info('Creating payment order...');

      // Create payment order
      const response = await fetch('/api/phonepe/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: planId,
          amount: baseAmount,
          plan_name: planName
        })
      });

      const paymentData = await response.json();

      if (paymentData.success) {
        setPaymentToken(paymentData.payment_token);
        setMerchantOrderId(paymentData.merchant_order_id);
        
        toast.success('Payment order created successfully');
        
        // Configure PhonePe checkout
        const checkoutConfig = {
          tokenUrl: `/api/phonepe/get-token/${paymentData.merchant_order_id}`,
          callback: handlePaymentCallback,
          type: "IFRAME"
        };

        // Launch PhonePe checkout
        window.PhonePeCheckout.transact(checkoutConfig);
      } else {
        toast.error(paymentData.error || 'Payment initiation failed');
        onFailure(paymentData.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Payment initiation failed');
      onFailure('Payment initiation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCallback = async (response: any) => {
    console.log('PhonePe callback received:', response);
    
    if (response.code === 'USER_CANCEL') {
      toast.info('Payment cancelled by user');
      onCancel?.();
      return;
    }
    
    if (response.code === 'CONCLUDED') {
      // Payment concluded, verify status
      toast.info('Verifying payment...');
      
      try {
        const statusResponse = await fetch(`/api/phonepe/verify-payment/${response.merchantOrderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const statusData = await statusResponse.json();
        
        if (statusData.success && statusData.status_data?.payload?.state === 'COMPLETED') {
          toast.success('Payment successful!');
          onSuccess(response.merchantOrderId);
        } else if (statusData.status_data?.payload?.state === 'FAILED') {
          toast.error('Payment failed');
          onFailure('Payment failed');
        } else {
          toast.error('Payment verification failed');
          onFailure('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Payment verification failed');
        onFailure('Payment verification failed');
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Secure Payment</CardTitle>
          </div>
          <Badge variant="secondary" className="mx-auto">
            Powered by PhonePe
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Plan Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{planName}</span>
              <Badge variant="outline">{planName === 'Pro' ? 'Most Popular' : 'Best Value'}</Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              {planFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Plan Amount</span>
              <span>₹{baseAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>GST (18%)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <hr className="border-muted" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm font-medium mb-2">Supported Payment Methods:</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                UPI
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Cards
              </div>
              <span>Net Banking</span>
              <span>Wallets</span>
            </div>
          </div>
          
          {/* Payment Button */}
          <Button 
            onClick={initiatePayment}
            disabled={isLoading || !isScriptLoaded}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : !isScriptLoaded ? (
              'Loading Payment Gateway...'
            ) : (
              `Pay ₹${totalAmount.toFixed(2)} with PhonePe`
            )}
          </Button>

          {/* Transaction Info */}
          {merchantOrderId && (
            <div className="text-xs text-center text-muted-foreground">
              Order ID: {merchantOrderId}
            </div>
          )}
          
          {/* Security Note */}
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Secured by PhonePe Payment Gateway
            </p>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhonePeCheckout;