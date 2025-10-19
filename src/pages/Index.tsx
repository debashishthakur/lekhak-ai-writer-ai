import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import { lazy, Suspense } from "react";

const Features = lazy(() => import("@/components/Features"));
const Footer = lazy(() => import("@/components/Footer"));
const StarField = lazy(() => import("@/components/StarField"));

const Index = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <Suspense fallback={null}>
        <StarField />
      </Suspense>
      <Navigation />
      <div className="relative z-10">
        <Hero />
        <Suspense fallback={<div className="h-20 flex items-center justify-center"><div className="animate-pulse w-full h-4 bg-muted rounded"></div></div>}>
          <Features />
        </Suspense>
        <Suspense fallback={<div className="h-16 flex items-center justify-center"><div className="animate-pulse w-full h-4 bg-muted rounded"></div></div>}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
