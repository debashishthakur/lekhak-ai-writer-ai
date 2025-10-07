import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Languages, FileText, Brain, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Advanced AI Engine",
    description: "Powered by state-of-the-art language models for intelligent writing assistance.",
  },
  {
    icon: Zap,
    title: "Real-Time Suggestions",
    description: "Get instant improvements without interrupting your creative flow.",
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Write confidently in 50+ languages with context-aware translations.",
  },
  {
    icon: FileText,
    title: "Context Understanding",
    description: "AI that learns your style and adapts to your unique voice.",
  },
  {
    icon: Sparkles,
    title: "Smart Rewriting",
    description: "Transform your drafts into professional content with one click.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays private. We never store or train on your content.",
  },
];

const Features = () => {
  return (
    <section className="py-32 px-6 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-5xl md:text-6xl font-light">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Powerful AI tools designed to enhance your writing experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-500 hover:translate-y-[-8px] card-glow group"
              style={{
                animation: "slide-up-fade 0.6s ease-out forwards",
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              <CardContent className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-primary/30">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-medium">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
