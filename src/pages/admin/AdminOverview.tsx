import { BentoStats } from "@/components/BentoStats";
import BusMap from "@/components/BusMap";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { DemoController } from "@/components/DemoController";
import { Beaker, ShieldCheck } from "lucide-react";

export default function AdminOverview() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoRef = ref(rtdb, "system/demoMode");
    return onValue(demoRef, (snapshot) => {
      setIsDemoMode(snapshot.val() || false);
    });
  }, []);

  const toggleDemoMode = () => {
    set(ref(rtdb, "system/demoMode"), !isDemoMode);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <DemoController />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl backdrop-blur-xl gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-display font-bold flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Control Center
          </h2>
          <p className="text-white/40 text-[10px] md:text-sm mt-1">Switch Production and Demo modes.</p>
        </div>
        
        <button 
          onClick={toggleDemoMode}
          className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl md:rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all duration-500 border ${
            isDemoMode 
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          }`}
        >
          <Beaker className={`w-4 h-4 ${isDemoMode ? "animate-bounce" : ""}`} />
          {isDemoMode ? "VIVA DEMO ACTIVE" : "PRODUCTION ACTIVE"}
        </button>
      </div>

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
