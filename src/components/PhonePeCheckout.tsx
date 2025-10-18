import React, { useState } from 'react';
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
  const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);

  // Calculate amounts
  const baseAmount = amount;
  const gstAmount = baseAmount * 0.18;
  const totalAmount = baseAmount + gstAmount;

  // No script loading needed for direct redirect flow

  const initiatePayment = async () => {
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
        setMerchantOrderId(paymentData.merchant_order_id);
        
        toast.success('Payment order created successfully');
        
        // Redirect to PhonePe payment URL directly
        if (paymentData.payment_url) {
          window.location.href = paymentData.payment_url;
        } else {
          toast.error('No payment URL received');
          onFailure('No payment URL received');
        }
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
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
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