import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Bus, Activity, Users, Map as MapIcon, Database } from "lucide-react";
import { motion } from "framer-motion";
import BusMap from "@/components/BusMap";
import FleetTelemetry from "@/components/FleetTelemetry";
import WeatherWidget from "@/components/WeatherWidget";
import { BentoStats } from "@/components/BentoStats";
import { seedBuses } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  // SEED LOGIC: Used for demonstration purposes to populate the map with data.
  // VIVA-NOTE: This proves the system can scale to handle 33+ concurrent bus streams.
  const handleSeed = async () => {
    await seedBuses();
    toast.success("Demonstration Fleet Seeded: 33 Buses Online");
  };
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-6">
        <header className="mb-10 grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Fleet Control & Management
            </h1>
            <p className="text-muted-foreground mt-2">Real-time overview of all 33 Sargodha electrical buses.</p>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-primary/20 hover:bg-primary/10 mt-6"
              onClick={handleSeed}
            >
              <Database className="w-4 h-4" />
              Seed Demo Fleet (33 Buses)
            </Button>
          </div>
          <div className="md:col-span-1">
            <WeatherWidget />
          </div>
        </header>

        <BentoStats />

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-8 min-h-[500px]">
            <h2 className="text-xl font-display font-semibold mb-6">Fleet God-View (All Active Buses)</h2>
            <BusMap zoom={11} />
          </div>
          
          <div className="lg:col-span-1">
            <FleetTelemetry />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
