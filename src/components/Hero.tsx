import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            Lekhak AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent writing companion. Transform your thoughts into polished prose with AI-powered assistance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Add to Chrome
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-muted hover:bg-muted/50 transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-4">
          Free to install • No credit card required
        </p>
      </div>
    </section>
  );
};

export default Hero;
