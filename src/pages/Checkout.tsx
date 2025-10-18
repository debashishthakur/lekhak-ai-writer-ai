import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import PhonePeCheckout from "@/components/PhonePeCheckout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');

  // Get plan details from URL params
  const planParam = searchParams.get('plan');
  const amountParam = searchParams.get('amount');

  // Plan configurations
  const planConfigs = {
    pro: {
      id: 'pro_plan',
      name: 'Pro',
      amount: 399,
      features: [
        '1,000 uses per month',
        'Advanced AI rewriting',
        'Grammar checking',
        'Tone adjustment',
        'Priority support'
      ]
    },
    unlimited: {
      id: 'unlimited_plan',
      name: 'Unlimited',
      amount: 1599,
      features: [
        'Unlimited usage',
        'All Pro features',
        'API access',
        'Custom integrations',
        'Premium support',
        'Early access to new features'
      ]
    }
  };

  const currentPlan = planParam && planConfigs[planParam as keyof typeof planConfigs] 
    ? planConfigs[planParam as keyof typeof planConfigs]
    : null;

  // Generate or retrieve user ID
  useEffect(() => {
    // In a real implementation, you'd get this from authentication context
    // For now, we'll generate or retrieve from localStorage
    let storedUserId = localStorage.getItem('lekhak_user_id');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('lekhak_user_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Validate plan
  if (!currentPlan) {
    return (
      <div className="gradient-animate min-h-screen relative">
        <StarField />
        <Navigation />
        <div className="relative z-10 container mx-auto px-6 py-24">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-4">Invalid Plan</h1>
              <p className="text-muted-foreground mb-6">
                The selected plan is not valid. Please choose a plan from our pricing page.
              </p>
              <Button onClick={() => navigate('/pricing')} className="w-full">
                View Pricing Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = (transactionId: string) => {
    toast.success('Payment successful!');
    
    // Store successful payment info
    localStorage.setItem('last_payment', JSON.stringify({
      transactionId,
      plan: currentPlan.name,
      amount: currentPlan.amount,
      timestamp: new Date().toISOString()
    }));

    // Redirect to success page
    navigate(`/payment/success?transaction=${transactionId}&plan=${currentPlan.name}`);
  };

  const handlePaymentFailure = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    
    // Log failure for analytics
    console.error('Payment failure:', error);
    
    // Could redirect to failure page or stay on checkout
    // navigate('/payment/failure');
  };

  const handlePaymentCancel = () => {
    toast.info('Payment cancelled');
    // Stay on checkout page for retry
  };

  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      
      {/* Blurred background effect */}
      <div className="absolute inset-0 backdrop-blur-sm z-0" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pricing')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pricing
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
            Complete Your Purchase
          </h1>
          <p className="text-xl text-muted-foreground">
            Upgrade to {currentPlan.name} plan and unlock powerful AI writing features
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Plan Summary */}
          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {currentPlan.name} Plan Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Why Choose This Plan */}
            <Card className="border-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Why Choose {currentPlan.name}?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {currentPlan.name === 'Pro' ? (
                  <>
                    <p>Perfect for professionals and content creators who need reliable AI writing assistance.</p>
                    <p>Get advanced features at an affordable price with excellent value for money.</p>
                    <p>Ideal for regular users who want consistent quality and priority support.</p>
                  </>
                ) : (
                  <>
                    <p>Best for power users, agencies, and businesses with heavy writing needs.</p>
                    <p>No limits on usage - perfect for content teams and high-volume requirements.</p>
                    <p>Includes API access for custom integrations and workflow automation.</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Component */}
          <div className="flex flex-col justify-start">
            {userId ? (
              <PhonePeCheckout
                userId={userId}
                planId={currentPlan.id}
                amount={currentPlan.amount}
                planName={currentPlan.name}
                planFeatures={currentPlan.features}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={handlePaymentCancel}
              />
            ) : (
              <Card className="border-muted/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Loading payment form...</p>
                </CardContent>
              </Card>
            )}
            
            {/* Trust Indicators */}
            <div className="mt-6 space-y-3 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>🔒 Secure Payment</span>
                <span>🇮🇳 Made in India</span>
                <span>⚡ Instant Activation</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Your subscription will be activated immediately after successful payment.
                You can cancel anytime from your account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;