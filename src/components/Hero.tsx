import { Button } from "@/components/ui/button";
import { Chrome, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-primary/30 backdrop-blur-sm animate-scale-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI-Powered Writing Assistant</span>
        </div>

        {/* Main heading with staggered animation */}
        <div className="space-y-6">
          <h1 
            className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-glow animate-slide-up-fade"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            Lekhak AI
          </h1>
          <p 
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up-fade"
            style={{ animationDelay: "0.4s", opacity: 0 }}
          >
            Transform your thoughts into polished prose with the power of artificial intelligence
          </p>
        </div>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-slide-up-fade"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <Button 
            size="lg" 
            className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] group"
          >
            <Chrome className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
            Add to Chrome - It's Free
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-10 py-7 border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 hover:scale-105"
          >
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div 
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16 animate-slide-up-fade"
          style={{ animationDelay: "0.8s", opacity: 0 }}
        >
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">5M+</div>
            <div className="text-sm text-muted-foreground">Words Written</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">99%</div>
            <div className="text-sm text-muted-foreground">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
