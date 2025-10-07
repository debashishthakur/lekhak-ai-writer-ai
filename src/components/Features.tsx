import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Languages, FileText } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Writing",
    description: "Generate, refine, and enhance your content with advanced AI algorithms.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant suggestions and improvements without breaking your flow.",
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Write confidently in multiple languages with intelligent translation.",
  },
  {
    icon: FileText,
    title: "Context-Aware",
    description: "Smart assistance that understands your writing style and context.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to write better, faster, and smarter.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:translate-y-[-4px]"
            >
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
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
