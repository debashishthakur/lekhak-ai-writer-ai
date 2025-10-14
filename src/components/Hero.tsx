import { Button } from "@/components/ui/button";
import { LogIn, CheckCircle, Loader2 } from "lucide-react";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { useState } from "react";
const Hero = () => {
  const { user, isSignedIn, signIn, isLoading } = useGoogleAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleJoinWaitlist = async () => {
    if (isSignedIn) {
      return;
    }

    try {
      setIsSigningIn(true);
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </>
      );
    }

    if (isSignedIn && user) {
      return (
        <>
          <CheckCircle className="h-5 w-5" />
          Welcome, {user.name.split(' ')[0]}!
        </>
      );
    }

    if (isSigningIn) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Signing in...
        </>
      );
    }

    return (
      <>
        Join waitlist
        <span className="mx-3 text-muted-foreground">|</span>
        <LogIn className="h-5 w-5" />
      </>
    );
  };

  return <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{
      animationDelay: "1.5s"
    }} />
      
      <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center justify-center">
        {/* Main heading - centered */}
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-tight animate-slide-up-fade mb-12" style={{
          animationDelay: "0.2s",
          opacity: 0,
          fontWeight: 900,
          letterSpacing: '-0.02em'
        }}>
          <span className="text-glow text-[#7dd3fc]">ले</span>
          <span className="text-white">khak</span>
        </h1>
        
        {/* Rest of content below */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-tight animate-slide-up-fade" style={{
            animationDelay: "0.3s",
            opacity: 0
          }}>
            Write better with AI,
            <br />
            <span className="font-light">effortlessly</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light animate-slide-up-fade" style={{
            animationDelay: "0.4s",
            opacity: 0
          }}>
            Leading research in AI writing technology,
            <br />
            transforming how you create content.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-4 pt-4 animate-slide-up-fade" style={{
        animationDelay: "0.6s",
        opacity: 0
      }}>
          <Button 
            variant="pill" 
            size="xl" 
            className="group" 
            onClick={handleJoinWaitlist}
            disabled={isLoading || isSigningIn || isSignedIn}
          >
            {getButtonContent()}
          </Button>
          
          <p className="text-sm text-muted-foreground font-light">
            {isSignedIn ? "You're on the waitlist!" : "No credit card required"}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-8 animate-slide-up-fade" style={{
        animationDelay: "0.8s",
        opacity: 0
      }}>
          {["Smart Rewriting", "Grammar Check", "Tone Adjustment", "Multi-Language", "AI Suggestions"].map(feature => <div key={feature} className="px-6 py-3 rounded-full bg-card/50 border border-primary/20 backdrop-blur-sm text-sm font-light hover:border-primary/40 hover:bg-card/70 transition-all cursor-pointer">
              {feature}
            </div>)}
        </div>
      </div>
    </section>;
};
export default Hero;