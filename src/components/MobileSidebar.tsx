import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, FileText, Info, HelpCircle, CreditCard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const MobileSidebar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path: string) => {
    // Haptic feedback simulation for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    navigate(path);
    setIsOpen(false);
  };

  const navigationItems = [
    {
      title: "Plans & Pricing",
      icon: CreditCard,
      path: "/pricing",
      description: "Choose your plan"
    },
    {
      title: "About Us",
      icon: Info,
      path: "/about",
      description: "Learn about Lekhak AI"
    },
    {
      title: "Support",
      icon: HelpCircle,
      path: "/support",
      description: "Get help when you need it"
    },
  ];

  const policyItems = [
    {
      title: "Terms and Conditions",
      path: "/terms",
    },
    {
      title: "Privacy Policy", 
      path: "/privacy-policy",
    },
    {
      title: "Refund Policy",
      path: "/refund-policy",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden backdrop-blur-sm"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-80 sm:w-96 p-0 bg-background/95 backdrop-blur-md border-l border-border/50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div 
              onClick={() => handleNavigation("/")}
              className="text-xl font-bold text-glow cursor-pointer"
            >
              <span className="text-[#7dd3fc]">ले</span>
              <span className="text-foreground">khak</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Navigation
              </h3>
              
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 hover:bg-accent/50 active:bg-accent/70 group ${
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </button>
                );
              })}

              <Separator className="my-4" />

              {/* Policies Section */}
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Policies
              </h3>
              
              {policyItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 hover:bg-accent/50 active:bg-accent/70 group ${
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <div className="flex-1 font-medium">{item.title}</div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            <div className="text-center text-sm text-muted-foreground">
              Made with ❤️ for writers
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

MobileSidebar.displayName = 'MobileSidebar';

export default MobileSidebar;