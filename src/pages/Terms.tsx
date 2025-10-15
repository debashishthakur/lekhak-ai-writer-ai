import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";

const Terms = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="backdrop-blur-sm bg-background/80 rounded-lg p-12 border border-white/10">
          <h1 className="text-4xl font-bold mb-8 text-center font-['Open_Sans']">
            Terms and Conditions
          </h1>
          <p className="text-lg text-muted-foreground text-center font-['Open_Sans']">
            By using Lekhak AI, you agree to our terms of service and acceptable use policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
