import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button 
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-glow cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[#7dd3fc]">ले</span>
          <span className="text-white">khak</span>
        </button>
        
        {location.pathname === "/" && (
          <Button 
            variant="outline" 
            onClick={() => navigate("/pricing")}
            className="backdrop-blur-sm"
          >
            Plans & Pricing
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
