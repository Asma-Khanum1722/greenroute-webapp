import { BentoStats } from "@/components/BentoStats";
import BusMap from "@/components/BusMap";
import { motion } from "framer-motion";

export default function AdminOverview() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <BentoStats />
      
      <div className="glass-card p-2 min-h-[600px] border-white/5 relative overflow-hidden group">
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3 px-4 py-2 bg-background/80 backdrop-blur-md rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Global Fleet View</span>
        </div>
        <BusMap zoom={12} className="rounded-2xl" />
      </div>
    </motion.div>
  );
}
