import { RouteManager } from "@/components/RouteManager";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function AdminRoutes() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary" />
          Route Network Designer
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Expand the Sargodha GreenRoute network by registering new transit lines and terminals.
        </p>
      </div>
      
      <RouteManager />
    </motion.div>
  );
}
