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

const routes = [
  {
    id: "E1",
    name: "Sargodha - Bhalwal",
    from: "Chak 91 Terminal",
    to: "Bhalwal City",
    stops: 15,
    duration: "55 min",
    firstBus: "6:00 AM",
    lastBus: "12:00 AM",
    frequency: "Every 20 min",
    color: "from-primary to-emerald-500",
  },
  {
    id: "E2",
    name: "Sargodha - Kot Momin",
    from: "Chak 91 Terminal",
    to: "Kot Momin",
    stops: 12,
    duration: "45 min",
    firstBus: "6:30 AM",
    lastBus: "11:30 PM",
    frequency: "Every 30 min",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "E3",
    name: "Sargodha - Sillanwali",
    from: "Chak 91 Terminal",
    to: "Sillanwali",
    stops: 10,
    duration: "40 min",
    firstBus: "6:00 AM",
    lastBus: "12:00 AM",
    frequency: "Every 25 min",
    color: "from-teal-500 to-cyan-500",
  },
];

const schedule = [
  { time: "6:00 AM", routeA: "✓", routeB: "-", routeC: "✓" },
  { time: "7:00 AM", routeA: "✓", routeB: "✓", routeC: "✓" },
  { time: "8:00 AM", routeA: "✓", routeB: "✓", routeC: "✓" },
  { time: "9:00 AM", routeA: "✓", routeB: "✓", routeC: "✓" },
  { time: "10:00 AM", routeA: "✓", routeB: "✓", routeC: "✓" },
  { time: "11:00 AM", routeA: "✓", routeB: "✓", routeC: "✓" },
  { time: "12:00 PM", routeA: "✓", routeB: "✓", routeC: "✓" },
];

const fares = [
  {
    icon: Users,
    category: "General (Male)",
    price: "Rs. 20",
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
    category: "Senior/PWD",
    price: "Rs. 0",
    description: "Free travel for seniors",
  },
  {
    icon: Wallet,
    category: "Women",
    price: "Rs. 0",
    description: "Free travel for all women",
  },
];

const downloads = [
  { name: "Complete Route Map", size: "2.4 MB", type: "PDF" },
  { name: "Bus Schedule Timetable", size: "1.1 MB", type: "PDF" },
  { name: "Fare Chart 2025", size: "0.5 MB", type: "PDF" },
  { name: "Stop Locations Guide", size: "3.2 MB", type: "PDF" },
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
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
              <Bus className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                3 Active Routes
              </span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
              Routes & Schedules
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan your journey with our comprehensive route information,
              timetables, and fare details.
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
            className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-8"
          >
            Available Routes
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {routes.map((route) => (
              <motion.div
                key={route.id}
                variants={itemVariants}
                className="glass-card glass-card-hover p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${route.color} flex items-center justify-center`}
                  >
                    <span className="font-display font-bold text-lg text-foreground">
                      {route.id}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {route.stops} stops
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  {route.name}
                </h3>

                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{route.from}</span>
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm">{route.to}</span>
                </div>

                <div className="space-y-2 pt-4 border-t border-foreground/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">{route.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="text-foreground">{route.frequency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">First Bus</span>
                    <span className="text-foreground">{route.firstBus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Bus</span>
                    <span className="text-foreground">{route.lastBus}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Schedule Timetable */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              Morning Schedule
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Weekday timings</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-left p-4 font-display font-semibold text-foreground">
                      Time
                    </th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-emerald-500" />
                        Route A
                      </span>
                    </th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" />
                        Route B
                      </span>
                    </th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500" />
                        Route C
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, index) => (
                    <tr
                      key={row.time}
                      className={`border-b border-foreground/5 ${
                        index % 2 === 0 ? "bg-foreground/[0.02]" : ""
                      }`}
                    >
                      <td className="p-4 text-foreground font-medium">
                        {row.time}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={
                            row.routeA === "✓"
                              ? "text-primary font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {row.routeA}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={
                            row.routeB === "✓"
                              ? "text-primary font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {row.routeB}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={
                            row.routeC === "✓"
                              ? "text-primary font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {row.routeC}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fare Information */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-8"
          >
            Fare Information
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
                className="glass-card glass-card-hover p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <fare.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  {fare.category}
                </h3>
                <div className="font-display font-bold text-3xl text-primary mb-2">
                  {fare.price}
                </div>
                <p className="text-sm text-muted-foreground">
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
            className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-8"
          >
            Downloadable Resources
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
                className="glass-card glass-card-hover p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <span className="font-display font-bold text-xs text-destructive">
                      {file.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{file.name}</h4>
                    <span className="text-sm text-muted-foreground">
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
