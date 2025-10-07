import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";

const Index = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <div className="relative z-10">
        <Hero />
        <Features />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
