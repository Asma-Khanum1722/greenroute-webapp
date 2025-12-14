import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { BentoStats } from "@/components/BentoStats";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Partners } from "@/components/Partners";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Noise Overlay for entire page */}
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      
      <Navbar />
      
      <article>
        <HeroSection />
        <BentoStats />
        <FeatureShowcase />
        <Partners />
      </article>
      
      <Footer />
    </main>
  );
};

export default Index;
