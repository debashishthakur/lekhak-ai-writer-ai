import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";

const RefundPolicy = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="backdrop-blur-sm bg-background/80 rounded-lg p-12 border border-white/10">
          <h1 className="text-4xl font-bold mb-8 text-center font-['Open_Sans']">
            Refund Policy
          </h1>
          <p className="text-lg text-muted-foreground text-center font-['Open_Sans']">
            We offer a 30-day money-back guarantee for all paid subscriptions with no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
