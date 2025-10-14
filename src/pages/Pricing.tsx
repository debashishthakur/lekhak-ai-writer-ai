import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      limits: "7 uses per day",
      features: [
        "Basic text rewriting",
        "Daily reset at midnight UTC",
        "Standard support"
      ]
    },
    {
      name: "Pro",
      price: "$4.99",
      period: "/month",
      limits: "1,000 uses per month",
      features: [
        "Advanced AI rewriting",
        "Grammar checking",
        "Tone adjustment",
        "Priority support",
        "Monthly reset on billing date"
      ],
      popular: true
    },
    {
      name: "Unlimited",
      price: "$19.99",
      period: "/month",
      yearlyPrice: "$199.99/year",
      limits: "Unlimited usage",
      features: [
        "All Pro features",
        "API access",
        "Custom integrations",
        "Premium support",
        "Early access to new features"
      ]
    }
  ];

  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      
      {/* Blurred background effect */}
      <div className="absolute inset-0 backdrop-blur-sm z-0" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-glow">
            Plans & Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative card-glow ${
                plan.popular 
                  ? "border-primary shadow-[0_0_30px_rgba(125,211,252,0.3)] scale-105" 
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  {plan.yearlyPrice && (
                    <div className="text-sm text-muted-foreground mt-1">
                      or {plan.yearlyPrice}
                    </div>
                  )}
                </div>
                <CardDescription className="text-base">
                  {plan.limits}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-6">
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  Upgrade
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
