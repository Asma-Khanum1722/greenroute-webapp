import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Leaf, Clock, MapPin, Bus } from "lucide-react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { SARGODHA_ROUTES } from "@/lib/routes";

const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState<number>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
};

const RouteAnimation = () => {
  return (
    <svg className="w-full h-32" viewBox="0 0 400 100">
      <motion.path
        d="M 20 50 Q 100 20, 180 50 T 340 50"
        fill="none"
        stroke="hsl(152 100% 32% / 0.3)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.path
        d="M 20 50 Q 100 20, 180 50 T 340 50"
        fill="none"
        stroke="hsl(152 100% 32%)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="20 10"
        className="animate-route-flow"
        style={{ strokeDashoffset: 100 }}
      />
      {/* Bus Dots */}
      <motion.circle
        cx="60"
        cy="40"
        r="6"
        fill="hsl(152 100% 32%)"
        animate={{ x: [0, 280, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        cx="180"
        cy="50"
        r="6"
        fill="hsl(152 100% 32%)"
        animate={{ x: [0, 160, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
      />
      {/* Stops */}
      <circle cx="20" cy="50" r="4" fill="hsl(152 100% 32% / 0.5)" />
      <circle cx="340" cy="50" r="4" fill="hsl(152 100% 32% / 0.5)" />
      <text x="20" y="75" fill="hsl(215 16% 57%)" fontSize="10" textAnchor="middle">GBS Sargodha</text>
      <text x="340" y="75" fill="hsl(215 16% 57%)" fontSize="10" textAnchor="middle">Bhalwal Terminus</text>
    </svg>
  );
};

export const BentoStats = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [activeBusesCount, setActiveBusesCount] = useState(0);
  const totalRoutesCount = SARGODHA_ROUTES.length;
  const totalStopsCount = SARGODHA_ROUTES.reduce((acc, route) => acc + route.stops.length, 0);

  useEffect(() => {
    const busesRef = ref(rtdb, "buses");
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const count = Object.values(data).filter((bus: any) => bus.status === "active").length;
        setActiveBusesCount(count);
      } else {
        setActiveBusesCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="status" className="py-8 md:py-24 relative overflow-hidden scroll-mt-32">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />

      <div className="container mx-auto px-10 md:px-16 lg:px-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-display font-bold text-2xl md:text-4xl lg:text-5xl text-white mb-3">
            System Status
          </h2>
          <p className="text-white/40 text-sm md:text-lg max-w-xl mx-auto">
            Real-time metrics from Sargodha's network
          </p>
        </motion.div>
 
        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {/* Active Buses - Tall Card */}
          <motion.div
            variants={itemVariants}
            className="sm:col-span-2 lg:col-span-1 lg:row-span-2 glass-card p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-primary/20 to-primary/5 min-h-[220px]"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <Bus className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <div className="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white mb-2 leading-none">
                <AnimatedCounter end={activeBusesCount} />
              </div>
              <p className="text-white/40 text-xs sm:text-lg">Active Buses</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest text-primary">Live Signal Stream</span>
              </div>
            </div>
          </motion.div>

          {/* Live Map Preview - Wide Card */}
          <motion.div
            variants={itemVariants}
            className="sm:col-span-2 glass-card glass-card-hover p-6 min-h-[160px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Network Trajectory</span>
            </div>
            <RouteAnimation />
          </motion.div>

          {/* Total Routes */}
          <motion.div
            variants={itemVariants}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between min-h-[140px]"
          >
            <div className="font-display font-bold text-4xl sm:text-5xl text-primary mb-2">
              <AnimatedCounter end={totalRoutesCount} />
            </div>
            <p className="text-muted-foreground text-[10px] sm:text-sm font-semibold uppercase tracking-wider">Active Routes</p>
          </motion.div>

          {/* Total Stops */}
          <motion.div
            variants={itemVariants}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between min-h-[140px]"
          >
            <div className="font-display font-bold text-4xl sm:text-5xl text-primary mb-2">
              <AnimatedCounter end={totalStopsCount} />
            </div>
            <p className="text-muted-foreground text-[10px] sm:text-sm font-semibold uppercase tracking-wider">Official Stops</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

