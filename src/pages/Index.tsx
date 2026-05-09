import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { BentoStats } from "@/components/BentoStats";
import BusMap from "@/components/BusMap";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { FleetShowcase } from "@/components/FleetShowcase";
import { Partners } from "@/components/Partners";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen } from "lucide-react";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Noise Overlay for entire page */}
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      
      <Navbar />
      
      <article className="relative z-10">
        <HeroSection />
        
        <section id="live-map" className="container mx-auto px-10 md:px-16 lg:px-32 py-12 md:py-20 scroll-mt-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-5xl font-display font-bold mb-4">
              Live Real-Time Tracking
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto px-4">
              Monitor the exact location of every electrical bus in Sargodha. 
              Powered by precision GPS for zero uncertainty transit.
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-1 gap-8">
            <div className="lg:col-span-1">
              <BusMap />
            </div>
          </div>
        </section>

        <div className="space-y-4 md:space-y-0">
          <BentoStats />
          <div className="container mx-auto px-10 md:px-16 lg:px-32">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
          </div>
          
          <FleetShowcase />
          <div className="container mx-auto px-10 md:px-16 lg:px-32">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
          </div>

          <FeatureShowcase />
          <div className="container mx-auto px-10 md:px-16 lg:px-32">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
          </div>

          <Partners />
        </div>
      </article>
      
      <Footer />
    </main>
  );
};

export default Index;
