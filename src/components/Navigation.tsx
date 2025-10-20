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
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 backdrop-blur-md bg-background/30 border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button 
          onClick={() => navigate("/")}
          className="text-xl md:text-2xl font-bold text-glow cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[#7dd3fc]">ले</span>
          <span className="text-white">khak</span>
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-lg font-medium"
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
            variant="ghost" 
            onClick={() => navigate("/about")}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-lg font-medium"
          >
            About Us
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate("/support")}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-lg font-medium"
          >
            Support
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate("/pricing")}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-lg font-medium border border-white/20 hover:border-white/40"
          >
            Plans & Pricing
          </Button>
        </div>
        
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
