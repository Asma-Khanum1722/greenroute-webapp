import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { BentoStats } from "@/components/BentoStats";
import BusMap from "@/components/BusMap";
import WeatherWidget from "@/components/WeatherWidget";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { FleetShowcase } from "@/components/FleetShowcase";
import { Partners } from "@/components/Partners";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen } from "lucide-react";

const Index = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Noise Overlay for entire page */}
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      
      <Navbar />
      
      <article className="relative z-10">
        <HeroSection />
        
        <section className="container mx-auto px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Live Real-Time Tracking
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Monitor the exact location of every electrical bus in Sargodha. 
              Powered by precision GPS for zero uncertainty transit.
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BusMap />
            </div>
            <div className="flex flex-col gap-6">
              <WeatherWidget />
              <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
                <h3 className="font-display font-semibold mb-2">Network Status</h3>
                <div className="flex items-center gap-2 text-sm text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Streams Active
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Currently consuming:
                  <br />• Open-Meteo REST API
                  <br />• OpenStreetMap Tile API
                  <br />• Firebase Realtime SDK
                </p>
              </div>
            </div>
          </div>
        </section>

        <BentoStats />
        <FleetShowcase />
        <FeatureShowcase />
        
        <Partners />
      </article>
      
      <Footer />
    </main>
  );
};

export default Index;
