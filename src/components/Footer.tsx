const Footer = () => {
  return (
    <footer className="border-t border-primary/20 py-16 px-6 mt-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-3">
            <h3 className="text-3xl font-bold text-glow">Lekhak AI</h3>
            <p className="text-muted-foreground">
              Your intelligent writing companion
            </p>
          </div>
          
          <div className="flex gap-10 text-sm">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:underline underline-offset-4"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:underline underline-offset-4"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:underline underline-offset-4"
            >
              Support
            </a>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary/10 text-center text-sm text-muted-foreground">
          © 2024 Lekhak AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
