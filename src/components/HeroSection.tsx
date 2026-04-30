import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Official Fleet Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ 
          backgroundImage: `url('/electric buses sargodha 1.jpg')`,
        }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/20 to-background z-0" />
      <div className="absolute inset-0 noise-overlay opacity-5 pointer-events-none z-0" />

      {/* Main Content - Massive vertical padding */}
      <div className="relative z-20 container mx-auto px-6 pt-48 pb-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Refined Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.2] tracking-tight mb-8"
          >
            Sargodha Moves with <br />
            <span className="text-gradient-green italic">GreenRoute.</span>
          </motion.h1>

          {/* Refined Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base text-muted-foreground max-w-xl mb-12 leading-relaxed opacity-70"
          >
            The division's first fully electric transit network. 
            Real-time tracking for every bus, every stop, every day.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-black rounded-full px-12 py-8 text-lg font-bold uppercase tracking-widest transition-all duration-500"
              onClick={() => document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Live Fleet Map
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
