import { FleetManager } from "@/components/FleetManager";
import { motion } from "framer-motion";
import { Database } from "lucide-react";

export default function AdminFleet() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          Fleet Inventory
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Add, modify, or decommission bus units from the Sargodha network.
        </p>
      </div>
      <FleetManager />
    </motion.div>
  );
}
