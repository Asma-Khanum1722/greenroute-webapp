import { useEffect, useState } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, User, Navigation, Gauge, Activity } from "lucide-react";
import { useDemo } from "@/lib/DemoContext";

interface BusData {
  id: string;
  lat: number;
  lng: number;
  speed: number;
  status: string;
  driverName?: string;
  lastUpdated: number;
}

const isActuallyActive = (bus: any, isDemoMode = false) => {
  if (bus.status === "inactive") return false;
  if ((Date.now() - (bus.lastUpdated || 0)) > 60000) return false;
  if (!bus.lat || !bus.lng) return false;
  if (bus.lat < 23 || bus.lat > 37) return false;
  if (bus.lng < 60 || bus.lng > 77) return false;
  if (!isDemoMode && !bus.driverEmail) return false;
  return true;
};

export default function FleetTelemetry() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const { isDemoMode, buses: demoBuses } = useDemo();

  // VIVA-EXPLANATION: We use 'onValue' to create a real-time listener.
  // This is much more efficient than 'polling' the database every few seconds.
  useEffect(() => {
    if (isDemoMode) {
      setBuses([...demoBuses].sort((a, b) => a.id.localeCompare(b.id)));
      return;
    }

    const busesRef = ref(rtdb, "buses");
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const busList = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            ...value,
            id: value.id || key.toUpperCase() // Fallback to database key uppercase
          }))
          .filter(bus => bus.id && bus.id !== "undefined");
        
        // Sort by ID to keep the table stable
        setBuses(busList.sort((a, b) => (a.id || "").localeCompare(b.id || "")));
      } else {
        setBuses([]);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode, demoBuses]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="glass-card overflow-hidden border-primary/20">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <h3 className="font-display font-bold flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          Live Fleet Telemetry
        </h3>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Real-Time Data Stream Active
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-muted-foreground bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Vehicle ID</th>
              <th className="px-6 py-4 font-medium">Driver</th>
              <th className="px-6 py-4 font-medium">Speed</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Last Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {buses.map((bus) => (
                <motion.tr 
                  key={bus.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Bus className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-white">{bus.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                      <User className="w-3 h-3" />
                      <span className="text-sm">{bus.driverName || "System Auto"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 font-mono font-bold ${bus.speed > 60 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                      <Navigation className="w-3 h-3 rotate-45" />
                      {bus.speed} <span className="text-[10px] opacity-50">KM/H</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isActuallyActive(bus, isDemoMode) ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {bus.status}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        OFFLINE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[10px] text-muted-foreground">
                    {formatTimeAgo(bus.lastUpdated)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {buses.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Waiting for live fleet signals...</p>
          <p className="text-xs opacity-50 mt-1">Start a driver shift to see live data</p>
        </div>
      )}
    </div>
  );
}
