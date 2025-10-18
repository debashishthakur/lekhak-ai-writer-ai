import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, ArrowRight, Gift } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const transactionId = searchParams.get('transaction');
  const planName = searchParams.get('plan');

  useEffect(() => {
    // In a real implementation, you'd verify the transaction with your backend
    // For now, we'll get details from localStorage or URL params
    const storedPayment = localStorage.getItem('last_payment');
    if (storedPayment) {
      setPaymentDetails(JSON.parse(storedPayment));
    }
  }, []);

  const planBenefits = {
    Pro: [
      '1,000 uses per month',
      'Advanced AI rewriting',
      'Grammar checking',
      'Tone adjustment',
      'Priority support'
    ],
    Unlimited: [
      'Unlimited usage',
      'All Pro features', 
      'API access',
      'Custom integrations',
      'Premium support',
      'Early access to new features'
    ]
  };

  const currentBenefits = planName && planBenefits[planName as keyof typeof planBenefits] 
    ? planBenefits[planName as keyof typeof planBenefits]
    : [];

  const downloadInvoice = () => {
    // In a real implementation, this would download the actual invoice
    alert('Invoice download will be implemented with backend integration');
  };

  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      
      {/* Blurred background effect */}
      <div className="absolute inset-0 backdrop-blur-sm z-0" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500" />
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome to Lekhak AI {planName} plan. Your subscription is now active!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Payment Details */}
          <Card className="border-green-500/20 bg-green-50/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Payment Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-semibold">{planName} Plan</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-xs">{transactionId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-semibold">PhonePe</p>
                </div>
                {paymentDetails && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold">₹{paymentDetails.amount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {new Date(paymentDetails.timestamp).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Button 
                variant="outline" 
                onClick={downloadInvoice}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Plan Benefits */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Your {planName} Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary mb-2">
                  🚀 Ready to get started?
                </p>
                <p className="text-xs text-muted-foreground">
                  Your subscription is now active. Start using Lekhak AI Chrome extension 
                  with all {planName} features enabled.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="mt-12 text-center space-y-6">
          <h2 className="text-2xl font-bold">What's Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-muted/50">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Install Extension</h3>
                <p className="text-sm text-muted-foreground">
                  Add Lekhak AI to Chrome and start improving your writing instantly
                </p>
              </CardContent>
            </Card>

            <Card className="border-muted/50">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✍️</span>
                </div>
                <h3 className="font-semibold mb-2">Start Writing</h3>
                <p className="text-sm text-muted-foreground">
                  Use AI-powered features on any website for better content
                </p>
              </CardContent>
            </Card>

            <Card className="border-muted/50">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold mb-2">Get Support</h3>
                <p className="text-sm text-muted-foreground">
                  Access priority support for any questions or help needed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/')}
              className="px-8"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/support')}
            >
              Contact Support
            </Button>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="border-yellow-500/20 bg-yellow-50/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-xl">💡</span>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Important Notes:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Your subscription starts immediately and renews monthly</li>
                    <li>• You can cancel anytime from your account settings</li>
                    <li>• For any issues, contact our support team</li>
                    <li>• Invoice will be sent to your email address</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;