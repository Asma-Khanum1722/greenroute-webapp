import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Leaf, Clock, MapPin } from "lucide-react";

const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
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
      <text x="20" y="75" fill="hsl(215 16% 57%)" fontSize="10" textAnchor="middle">University Rd</text>
      <text x="340" y="75" fill="hsl(215 16% 57%)" fontSize="10" textAnchor="middle">Company Bagh</text>
    </svg>
  );
};

export const BentoStats = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

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
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
            System Status
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Real-time metrics from Sargodha's transit network
          </p>
        </motion.div>

        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {/* Active Buses - Tall Card */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 lg:col-span-1 lg:row-span-2 glass-card glass-card-hover p-8 flex flex-col justify-between bg-gradient-to-br from-primary/20 to-primary/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-display font-bold text-6xl lg:text-7xl text-foreground mb-2">
                <AnimatedCounter end={33} />
              </div>
              <p className="text-muted-foreground text-lg">Active Buses</p>
            </div>
          </motion.div>

          {/* Live Map Preview - Wide Card */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 glass-card glass-card-hover p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm text-muted-foreground">Live Map Preview</span>
            </div>
            <RouteAnimation />
          </motion.div>

          {/* Avg Wait Time */}
          <motion.div
            variants={itemVariants}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between"
          >
            <Clock className="w-8 h-8 text-primary mb-4" />
            <div>
              <div className="font-display font-bold text-3xl text-foreground">
                <AnimatedCounter end={5} /> min
              </div>
              <p className="text-muted-foreground text-sm">Avg Wait Time</p>
            </div>
          </motion.div>

          {/* Zero Carbon */}
          <motion.div
            variants={itemVariants}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between"
          >
            <Leaf className="w-8 h-8 text-primary mb-4" />
            <div>
              <div className="font-display font-bold text-2xl text-foreground">
                Zero Carbon
              </div>
              <p className="text-muted-foreground text-sm">Eco Transit</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
