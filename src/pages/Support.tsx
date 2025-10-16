import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Support = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full">
          <Card className="bg-background/80 backdrop-blur-sm border-border">
            <CardContent className="p-8 md:p-12 space-y-8 font-['Open_Sans']">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  <span className="text-[#7dd3fc]">Lekhak AI</span> Support
                </h1>
                
                <p className="text-lg text-foreground/80 leading-relaxed">
                  Need help? Our support team is here to assist you with any questions or concerns about Lekhak AI.
                </p>
              </div>

              <div className="border-t border-border pt-8 mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Contact Support</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-[#7dd3fc] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <a 
                        href="mailto:debsthakur@gmail.com" 
                        className="text-foreground/70 hover:text-[#7dd3fc] transition-colors"
                      >
                        debsthakur@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-[#7dd3fc] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Contact</p>
                      <a 
                        href="tel:+919865667645" 
                        className="text-foreground/70 hover:text-[#7dd3fc] transition-colors"
                      >
                        +91 98656 67645
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-[#7dd3fc] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Address</p>
                      <p className="text-foreground/70">
                        HSR Sector 1<br />
                        Bangalore Urban, Karnataka<br />
                        PIN - 560102
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Support;
