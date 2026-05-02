import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MapPin,
  Clock,
  Download,
  Bus,
  ArrowRight,
  Wallet,
  Users,
  GraduationCap,
  Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SARGODHA_ROUTES, FARE_POLICY, SCHEDULE } from "@/lib/routes";

const fares = [
  {
    icon: Users,
    category: "General (Male)",
    price: `Rs. ${FARE_POLICY.generalMale}`,
    description: "Standard fare for adults",
  },
  {
    icon: GraduationCap,
    category: "Student",
    price: "Rs. 0",
    description: "Free travel with Student ID",
  },
  {
    icon: Accessibility,
    category: "Senior / PWD",
    price: "Rs. 0",
    description: "Free travel for seniors & disabled",
  },
  {
    icon: Wallet,
    category: "Women",
    price: "Rs. 0",
    description: "Free travel for all women",
  },
];

const downloads = [
  { name: "Complete Route Map (All 8 Routes)", size: "4.2 MB", type: "PDF" },
  { name: "Official Bus Schedule Timetable", size: "1.8 MB", type: "PDF" },
  { name: "Fare Policy Chart 2025", size: "0.5 MB", type: "PDF" },
  { name: "Fleet Specifications Guide", size: "2.5 MB", type: "PDF" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const RoutesSchedules = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 border-primary/20">
              <Bus className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">
                8 Active Routes | 128 Official Stops
              </span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
              Routes & Schedules
            </h1>
            <p className="text-lg text-muted-foreground">
              Official transit information for the Sargodha Electric Bus Service. 
              Launched 19 September 2025.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-12 flex items-center gap-4"
          >
            <span className="w-8 h-[2px] bg-primary"></span>
            Available Routes
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SARGODHA_ROUTES.map((route) => (
              <motion.div
                key={route.id}
                variants={itemVariants}
                className="glass-card glass-card-hover p-6 group border-white/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-display font-bold"
                    style={{ backgroundColor: route.color }}
                  >
                    {route.id.toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    {route.stops.length} stops
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                  {route.name}
                </h3>

                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium truncate max-w-[100px]">{route.from}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-xs font-medium truncate max-w-[100px]">{route.to}</span>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="text-foreground font-bold">{route.distanceKm} KM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Buses</span>
                    <span className="text-foreground font-bold">{route.busCount} Units</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Headway</span>
                    <span className="text-foreground font-bold">{route.headway} Min</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Schedule Timetable Summary */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6">Service Timing</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Operating Window</p>
                      <p className="text-xl font-bold">{SCHEDULE.firstBus} — {SCHEDULE.lastBus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Frequency</p>
                      <p className="text-xl font-bold">Every {SCHEDULE.frequencyMinutes} Minutes</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Operational Status
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  All 8 routes are currently active. Buses are monitored via GPS with sub-second latency tracking. 
                  Timings are subject to traffic conditions along the Railway Phataks and Jhal Chakian.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-black/40 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Peak Hours</p>
                    <p className="text-sm font-bold">08:00 - 11:00</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Service Type</p>
                    <p className="text-sm font-bold">Intra-Division</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fare Information */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-12 flex items-center gap-4"
          >
            <span className="w-8 h-[2px] bg-primary"></span>
            Fare Policy
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {fares.map((fare) => (
              <motion.div
                key={fare.category}
                variants={itemVariants}
                className="glass-card glass-card-hover p-6 text-center border-white/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 text-primary">
                  <fare.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  {fare.category}
                </h3>
                <div className="font-display font-bold text-3xl text-primary mb-2">
                  {fare.price}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {fare.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="py-16 pb-24">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-12 flex items-center gap-4"
          >
            <span className="w-8 h-[2px] bg-primary"></span>
            Downloads & Map
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {downloads.map((file) => (
              <motion.div
                key={file.name}
                variants={itemVariants}
                className="glass-card glass-card-hover p-5 flex items-center justify-between group border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="font-display font-bold text-[10px] text-primary">
                      {file.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{file.name}</h4>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {file.size}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default RoutesSchedules;
