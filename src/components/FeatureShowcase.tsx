import { motion } from "framer-motion";
import { MapPin, Brain, Smartphone, Clock } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Precision GPS",
    description:
      "Military-grade accuracy using driver smartphones. Every bus tracked to within 3 meters.",
    visual: "phone",
  },
  {
    icon: Brain,
    title: "Smart ETAs",
    description:
      "AI-powered arrival predictions that learn from traffic patterns and historical data.",
    visual: "card",
  },
];

const PhoneMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 50, rotateY: -15 }}
    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative perspective-1000"
  >
    <div className="relative w-64 h-[500px] mx-auto">
      {/* Phone Frame */}
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-foreground/20 to-foreground/5 p-2">
        <div className="w-full h-full rounded-[2.5rem] bg-card overflow-hidden border border-foreground/10">
          {/* Status Bar */}
          <div className="h-12 flex items-center justify-center">
            <div className="w-24 h-6 rounded-full bg-background" />
          </div>
          {/* Screen Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Driver Mode</div>
                <div className="text-xs text-muted-foreground">Route A Active</div>
              </div>
            </div>
            <div className="h-40 rounded-2xl bg-primary/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-xs text-muted-foreground">GPS Active</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded-full bg-foreground/10" />
              <div className="h-3 w-1/2 rounded-full bg-foreground/10" />
            </div>
          </div>
        </div>
      </div>
      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-primary/20 rounded-[4rem] blur-3xl -z-10" />
    </div>
  </motion.div>
);

const FloatingCard = () => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative"
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
      className="glass-card p-6 max-w-xs mx-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Next Bus</div>
          <div className="text-lg font-semibold text-foreground">Route A</div>
        </div>
      </div>
      <div className="text-center py-6">
        <div className="font-display font-bold text-5xl text-primary mb-1">2</div>
        <div className="text-muted-foreground">minutes away</div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>Live tracking enabled</span>
      </div>
    </motion.div>
    {/* Glow Effect */}
    <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl -z-10" />
  </motion.div>
);

export const FeatureShowcase = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
            Built for Precision
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Technology that makes public transit reliable
          </p>
        </motion.div>

        <div className="space-y-32">
          {/* Feature 1: Text Left, Visual Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-4">
                Precision GPS
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Military-grade accuracy using driver smartphones. Every bus is tracked
                to within 3 meters, giving you confidence in arrival times.
              </p>
              <ul className="space-y-3">
                {["3-meter accuracy", "Real-time updates", "Low battery consumption"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </motion.div>
            <div className="order-1 lg:order-2">
              <PhoneMockup />
            </div>
          </div>

          {/* Feature 2: Visual Left, Text Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-1">
              <FloatingCard />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-4">
                Live Telemetry
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Direct WebSocket streaming from the fleet to your device. Get second-by-second 
                updates on bus location, speed, and occupancy.
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time WebSocket data",
                  "Direct database sync",
                  "Zero-latency updates",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
