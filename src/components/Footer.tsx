import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-primary/20 py-16 px-6 mt-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-3">
            <h3 className="text-2xl font-medium">Lekhak AI</h3>
            <p className="text-muted-foreground font-light">
              Your intelligent writing companion
            </p>
          </div>
          
          <div className="flex gap-10 text-sm font-light">
            <Link 
              to="/privacy-policy" 
              className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <Link 
              to="/support" 
              className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:underline underline-offset-4"
            >
              Support
            </Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary/10 text-center text-sm text-muted-foreground font-light">
          © 2024 Lekhak AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
