import { DriverManager } from "@/components/DriverManager";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";

export default function AdminDrivers() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-primary" />
          Driver Manager
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Create driver accounts, manage access, and oversee driver profiles.
        </p>
      </div>
      <DriverManager />
    </motion.div>
  );
}
