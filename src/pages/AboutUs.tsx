import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
              {/* Mission Section */}
              <div className="space-y-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-tight text-foreground">
                  Our Mission
                </h1>
                
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <p>
                    We built Lekhak AI to fix one of the biggest modern writing pains — context switching.
                    Writers, creators, professionals — all of us waste hours hopping between ChatGPT, Grammarly, rewriters, and search tools. We built Lekhak to stop that.
                  </p>
                  
                  <p className="text-lg font-medium text-foreground italic">
                    Our mission is simple: "To keep you in your flow state — one tool, one click, zero distraction."
                  </p>
                </div>
              </div>

              {/* Privacy-First Philosophy Section */}
              <div className="space-y-6 pt-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-tight text-foreground">
                  Privacy-First Philosophy
                </h2>
                
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <p>
                    At Lekhak AI, privacy isn't a checkbox — it's our foundation.
                    We designed our system so you can use AI freely without sharing your identity or data.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Our Privacy Promise:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>No account creation needed</li>
                      <li>No personal data collected or stored</li>
                      <li>Content processed only once — never saved</li>
                      <li>Anonymous extension ID used for limits</li>
                      <li>Payment handled securely by Stripe</li>
                    </ul>
                  </div>
                  
                  <p className="font-medium text-foreground">
                    We believe you shouldn't trade privacy for productivity.
                  </p>
                </div>
              </div>

              {/* Why Privacy Matters Section */}
              <div className="space-y-6 pt-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-tight text-foreground">
                  Why Privacy Matters
                </h2>
                
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <p>
                    The world's most popular AI tools collect, analyze, and even train on your writing.
                    We don't.
                  </p>
                  
                  <p>
                    Our architecture is privacy-first by design, built to ensure that your words, ideas, and documents stay yours — always.
                  </p>
                </div>
              </div>

              {/* What Makes Us Different Section */}
              <div className="space-y-6 pt-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-tight text-foreground">
                  What Makes Us Different
                </h2>
                
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border bg-muted/30">
                        <TableHead className="font-semibold text-foreground">Core Value</TableHead>
                        <TableHead className="font-semibold text-foreground">How Lekhak AI Delivers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-border/50">
                        <TableCell className="font-medium text-foreground">Focus</TableCell>
                        <TableCell className="text-foreground/80">One tool for all writing needs</TableCell>
                      </TableRow>
                      <TableRow className="border-b border-border/50">
                        <TableCell className="font-medium text-foreground">Efficiency</TableCell>
                        <TableCell className="text-foreground/80">No tab switching or context loss</TableCell>
                      </TableRow>
                      <TableRow className="border-b border-border/50">
                        <TableCell className="font-medium text-foreground">Privacy</TableCell>
                        <TableCell className="text-foreground/80">No sign-up, no tracking, no storage</TableCell>
                      </TableRow>
                      <TableRow className="border-b border-border/50">
                        <TableCell className="font-medium text-foreground">Intelligence</TableCell>
                        <TableCell className="text-foreground/80">Custom AI models built for writing tasks</TableCell>
                      </TableRow>
                      <TableRow className="border-b border-border/50">
                        <TableCell className="font-medium text-foreground">Simplicity</TableCell>
                        <TableCell className="text-foreground/80">Prompt refinement for perfect outputs</TableCell>
                      </TableRow>
                      <TableRow className="border-b border-border/50">
                        <TableCell className="font-medium text-foreground">Trust</TableCell>
                        <TableCell className="text-foreground/80">Transparent, privacy-first policies</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Our Message Section */}
              <div className="space-y-6 pt-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-tight text-foreground">
                  Our Message to You
                </h2>
                
                <div className="text-center py-6 px-8 bg-muted/20 rounded-lg border border-border">
                  <p className="text-lg md:text-xl text-foreground/90 leading-relaxed italic">
                    "Your writing deserves freedom.<br />
                    Freedom from distractions.<br />
                    Freedom from sign-ups.<br />
                    Freedom from data mining.<br />
                    That's what Lekhak AI stands for."
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
                        href="mailto:lekhakaicontact@gmail.com" 
                        className="text-foreground/70 hover:text-[#7dd3fc] transition-colors"
                      >
                        lekhakaicontact@gmail.com
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
