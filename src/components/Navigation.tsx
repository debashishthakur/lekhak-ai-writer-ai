import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileSidebar from "./MobileSidebar";
import { memo } from "react";

const Navigation = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button 
          onClick={() => navigate("/")}
          className="text-xl md:text-2xl font-bold text-glow cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[#7dd3fc]">ले</span>
          <span className="text-white">khak</span>
        </button>
        
        {/* Desktop Navigation */}
        {location.pathname === "/" && (
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="backdrop-blur-sm border-white/20 hover:bg-white/10"
                >
                  Policies
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border-border/50">
                <DropdownMenuItem onClick={() => navigate("/terms")}>
                  Terms and Conditions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/refund-policy")}>
                  Refund Policy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/privacy-policy")}>
                  Privacy Policy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/about")}
              className="backdrop-blur-sm border-white/20 hover:bg-white/10"
            >
              About Us
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/support")}
              className="backdrop-blur-sm border-white/20 hover:bg-white/10"
            >
              Support
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/pricing")}
              className="backdrop-blur-sm border-white/20 hover:bg-white/10"
            >
              Plans & Pricing
            </Button>
          </div>
        )}
        
        {/* Mobile Navigation */}
        <div className="flex items-center gap-2">
          {/* Always show pricing button on mobile for non-home pages */}
          {location.pathname !== "/" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/pricing")}
              className="md:hidden backdrop-blur-sm border-white/20 hover:bg-white/10 text-xs"
            >
              Pricing
            </Button>
          )}
          
          {/* Mobile Sidebar - only show on home page or always show for navigation */}
          <MobileSidebar />
        </div>
      </div>
    </nav>
  );
});

export default Navigation;
