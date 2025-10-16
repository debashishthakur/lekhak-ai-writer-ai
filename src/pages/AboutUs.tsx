import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full">
          <Card className="bg-background/80 backdrop-blur-sm border-border">
            <CardContent className="p-8 md:p-12 space-y-8 font-['Open_Sans']">
              {/* About Section */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  About <span className="text-[#7dd3fc]">Lekhak AI</span>
                </h1>
                
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <p className="text-lg">
                    Welcome to <strong>Lekhak AI</strong>, your intelligent companion for all things writing. 
                    In today's fast-paced digital world, effective communication is more important than ever, 
                    and we're here to make it effortless.
                  </p>
                  
                  <p>
                    Lekhak AI is a cutting-edge AI-powered writing tool designed to help anyone—students, 
                    professionals, content creators, or anyone who works with text—to search, write, rewrite, 
                    and perfect their content with ease. Whether you need to craft compelling articles, refine 
                    your academic papers, polish business emails, or simply play around with text in creative 
                    ways, Lekhak AI has you covered.
                  </p>
                  
                  <p>
                    Our advanced artificial intelligence understands context, tone, and style, enabling you to:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Search:</strong> Find the right words and phrases instantly</li>
                    <li><strong>Write:</strong> Generate original content from scratch with AI assistance</li>
                    <li><strong>Rewrite:</strong> Transform existing text while preserving meaning</li>
                    <li><strong>Correct:</strong> Fix grammar, spelling, and punctuation errors automatically</li>
                    <li><strong>Enhance:</strong> Improve clarity, tone, and overall readability</li>
                    <li><strong>Customize:</strong> Adjust writing style to match your unique voice</li>
                  </ul>
                  
                  <p>
                    Whether you're looking to overcome writer's block, improve your language skills, or simply 
                    save time on editing, Lekhak AI empowers you to manipulate text in whichever way you can 
                    imagine. Our mission is to democratize quality writing, making professional-grade text 
                    editing accessible to everyone, regardless of their writing expertise.
                  </p>
                  
                  <p>
                    Join thousands of users who trust Lekhak AI to elevate their writing. Experience the future 
                    of intelligent text editing today.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t border-border pt-8 mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
                
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

export default AboutUs;
