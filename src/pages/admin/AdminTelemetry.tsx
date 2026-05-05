import FleetTelemetry from "@/components/FleetTelemetry";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function AdminTelemetry() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          Real-time Telemetry
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor speed, battery, and driver performance across all active routes.
        </p>
      </div>
      <div>
        <FleetTelemetry />
      </div>
    </motion.div>
  );
}
