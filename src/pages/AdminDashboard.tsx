import { ShieldCheck, Bus, Activity, Users, Map as MapIcon, Database } from "lucide-react";
import { motion } from "framer-motion";
import BusMap from "@/components/BusMap";
import { seedBuses } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const handleSeed = async () => {
    await seedBuses();
    toast.success("Demonstration Fleet Seeded: 33 Buses Online");
  };
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-6">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Fleet Control & Management
            </h1>
            <p className="text-muted-foreground mt-2">Real-time overview of all 33 Sargodha electrical buses.</p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/10"
            onClick={handleSeed}
          >
            <Database className="w-4 h-4" />
            Seed Demo Fleet (33 Buses)
          </Button>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Active Buses", value: "33", icon: Bus, color: "text-emerald-500" },
            { label: "System Status", value: "Optimal", icon: Activity, color: "text-blue-500" },
            { label: "Daily Passengers", value: "12.4k+", icon: Users, color: "text-primary" },
            { label: "Active Routes", value: "5", icon: MapIcon, color: "text-cyan-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <section className="glass-card p-8 min-h-[500px]">
          <h2 className="text-xl font-display font-semibold mb-6">Fleet God-View (All Active Buses)</h2>
          <BusMap zoom={11} />
        </section>
      </div>
      <Footer />
    </main>
  );
}
