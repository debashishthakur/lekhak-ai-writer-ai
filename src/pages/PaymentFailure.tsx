import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const error = searchParams.get('error');
  const transactionId = searchParams.get('transaction');
  const planName = searchParams.get('plan');

  const commonIssues = [
    {
      issue: "Insufficient Balance",
      solution: "Check your account balance and try again with a different payment method"
    },
    {
      issue: "Card Declined",
      solution: "Contact your bank or try using a different card"
    },
    {
      issue: "Network Error",
      solution: "Check your internet connection and retry the payment"
    },
    {
      issue: "Payment Timeout",
      solution: "The payment session expired. Please initiate a new payment"
    }
  ];

  const retryPayment = () => {
    // Navigate back to checkout with the same plan
    if (planName) {
      navigate(`/checkout?plan=${planName.toLowerCase()}`);
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      
      {/* Blurred background effect */}
      <div className="absolute inset-0 backdrop-blur-sm z-0" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Failure Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <XCircle className="h-20 w-20 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
            Payment Failed
          </h1>
          <p className="text-xl text-muted-foreground">
            We couldn't process your payment. Don't worry, you can try again.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Error Details */}
          <Card className="border-red-500/20 bg-red-50/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                {planName && (
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-semibold">{planName} Plan</p>
                  </div>
                )}
                
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="destructive">
                    Failed
                  </Badge>
                </div>
                
                {transactionId && (
                  <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-xs">{transactionId}</p>
                  </div>
                )}
                
                {error && (
                  <div>
                    <p className="text-muted-foreground">Error Reason</p>
                    <p className="font-semibold text-red-600">{error}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-semibold">PhonePe</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-semibold">
                    {new Date().toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  onClick={retryPayment}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Payment Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Pricing
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="border-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Common Issues & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {commonIssues.map((item, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <h4 className="font-medium text-sm mb-1">{item.issue}</h4>
                  <p className="text-xs text-muted-foreground">{item.solution}</p>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary mb-2">
                  💡 Still having issues?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Our support team is here to help you complete your purchase.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/support')}
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alternative Options */}
        <div className="mt-12 text-center space-y-6">
          <h2 className="text-2xl font-bold">Alternative Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-muted/50">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="font-semibold mb-2">Try Different Method</h3>
                <p className="text-sm text-muted-foreground">
                  Use UPI, net banking, or different card for payment
                </p>
              </CardContent>
            </Card>

            <Card className="border-muted/50">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold mb-2">Try Mobile</h3>
                <p className="text-sm text-muted-foreground">
                  Sometimes mobile payments work better than desktop
                </p>
              </CardContent>
            </Card>

            <Card className="border-muted/50">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="font-semibold mb-2">Try Later</h3>
                <p className="text-sm text-muted-foreground">
                  Payment gateway might be busy. Try again in a few minutes
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={retryPayment}
              className="px-8"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Payment
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/support')}
            >
              Get Help
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="border-blue-500/20 bg-blue-50/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-xl">📞</span>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Need Immediate Help?</p>
                  <div className="text-muted-foreground space-y-1">
                    <p>• Email: support@lekhakai.com</p>
                    <p>• Response time: Within 2 hours</p>
                    <p>• Include your transaction ID for faster assistance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;