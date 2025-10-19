import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Get merchant order ID from URL
  const merchantOrderId = searchParams.get('merchantOrderId');
  const planName = searchParams.get('plan');

  useEffect(() => {
    if (!merchantOrderId) {
      toast.error('Invalid payment verification request');
      navigate('/pricing');
      return;
    }

    verifyPayment();
  }, [merchantOrderId]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      
      // Call our payment verification API
      const response = await fetch(`/api/phonepe/verify-payment/${merchantOrderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      setVerificationResult(result);

      // Log the actual response for debugging
      if (import.meta.env.DEV) {
        console.log('Payment verification result:', result);
        console.log('Status data structure:', result.status_data);
      }

      // Check multiple possible paths for PhonePe state
      const phonepeState = 
        result.status_data?.payload?.state || 
        result.status_data?.state || 
        result.status_data?.data?.state ||
        (result.status_data?.success === true ? 'COMPLETED' : undefined);
      
      if (import.meta.env.DEV) {
        console.log('Detected PhonePe state:', phonepeState);
      }
      
      if (result.success && (phonepeState === 'COMPLETED' || phonepeState === 'SUCCESS')) {
        // Payment successful - store in localStorage and redirect
        const paymentInfo = {
          transactionId: merchantOrderId,
          plan: planName,
          amount: result.status_data?.payload?.amount || result.status_data?.amount || 0,
          timestamp: new Date().toISOString(),
          phonepeOrderId: result.status_data?.payload?.orderId || result.status_data?.orderId
        };

        localStorage.setItem('last_payment', JSON.stringify(paymentInfo));
        
        setTimeout(() => {
          navigate(`/payment/success?transaction=${merchantOrderId}&plan=${planName}`);
        }, 2000);
        
      } else if (phonepeState === 'FAILED') {
        // Payment failed
        if (import.meta.env.DEV) {
          console.log('Payment failed, redirecting to failure page');
        }
        setTimeout(() => {
          navigate(`/payment/failure?error=Payment failed&order=${merchantOrderId}`);
        }, 2000);
        
      } else {
        // Payment pending or unknown status
        if (import.meta.env.DEV) {
          console.log('Payment verification failed or unknown status, redirecting to failure page');
          console.log('Full result for debugging:', JSON.stringify(result, null, 2));
        }
        setTimeout(() => {
          navigate(`/payment/failure?error=Payment verification failed&order=${merchantOrderId}`);
        }, 2000);
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationResult({ success: false, error: 'Verification failed' });
      
      setTimeout(() => {
        navigate(`/payment/failure?error=Payment verification failed&order=${merchantOrderId}`);
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = () => {
    if (isVerifying) {
      return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
    }
    
    const phonepeState = 
      verificationResult?.status_data?.payload?.state || 
      verificationResult?.status_data?.state || 
      verificationResult?.status_data?.data?.state ||
      (verificationResult?.status_data?.success === true ? 'COMPLETED' : undefined);
    
    if (verificationResult?.success && (phonepeState === 'COMPLETED' || phonepeState === 'SUCCESS')) {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    }
    
    return <XCircle className="h-16 w-16 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (isVerifying) {
      return 'Verifying your payment...';
    }
    
    const phonepeState = 
      verificationResult?.status_data?.payload?.state || 
      verificationResult?.status_data?.state || 
      verificationResult?.status_data?.data?.state ||
      (verificationResult?.status_data?.success === true ? 'COMPLETED' : undefined);
    
    if (verificationResult?.success && (phonepeState === 'COMPLETED' || phonepeState === 'SUCCESS')) {
      return 'Payment successful! Redirecting...';
    }
    
    if (phonepeState === 'FAILED') {
      return 'Payment failed. Redirecting...';
    }
    
    return 'Payment verification failed. Redirecting...';
  };

  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      
      <div className="absolute inset-0 backdrop-blur-sm z-0" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>
            
            <h1 className="text-2xl font-bold mb-4">
              {getStatusMessage()}
            </h1>
            
            {merchantOrderId && (
              <p className="text-sm text-muted-foreground mb-4">
                Order ID: {merchantOrderId}
              </p>
            )}
            
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentVerification;