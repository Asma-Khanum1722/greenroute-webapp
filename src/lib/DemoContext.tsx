import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { SARGODHA_ROUTES, ORIGIN } from "./routes";
import { toast } from "sonner";
import { Play, ShieldAlert, Wifi, Database } from "lucide-react";

export interface Bus {
  id: string;
  key: string;
  routeId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: string;
  lastUpdated: number;
  driverName?: string;
  routeName?: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  buses: Bus[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("greenroute_mode") === "demo";
    }
    return false;
  });

  const [buses, setBuses] = useState<Bus[]>([]);
  const simBusesRef = useRef<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem("greenroute_mode", next ? "demo" : "production");
      
      // Fire visual toast with rich styling
      if (next) {
        toast("Demo Mode Active", {
          description: "Using simulated local telemetry. No database writes are performed.",
          icon: "🚀",
          duration: 4000,
        });
      } else {
        toast("Live Network Active", {
          description: "Synchronized with Firebase Realtime Database.",
          icon: "🌐",
          duration: 4000,
        });
      }
      return next;
    });
  };

  // Keyboard shortcut listener (Shift + D) to toggle demo mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") {
        e.preventDefault();
        toggleDemoMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Simulator
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isDemoMode) {
      setBuses([]);
      simBusesRef.current = [];
      return;
    }

    console.log("🚀 Client-Side Demo Mode Activated: Starting Isolated Simulation...");

    // Create 33 buses locally distributed across all routes
    const initialBuses = Array.from({ length: 33 }, (_, i) => {
      const route = SARGODHA_ROUTES[i % SARGODHA_ROUTES.length];
      const path = [ORIGIN, ...route.stops];
      const currentSegment = Math.floor(Math.random() * (path.length - 1));
      const progress = Math.random();
      const start = path[currentSegment];
      const end = path[currentSegment + 1];
      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;
      
      return {
        id: `E-${i + 1}`,
        key: `e${i + 1}`,
        routeId: route.id,
        routeName: route.name,
        path: path,
        currentSegment,
        progress,
        lat,
        lng,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: Math.floor(Math.random() * 15) + 30, // 30-45 km/h
        heading: Math.floor(Math.random() * 360),
        status: "active",
        lastUpdated: Date.now(),
        driverName: `Driver ${i + 1} (Sim)`
      };
    });

    simBusesRef.current = initialBuses;
    setBuses(initialBuses.map(({ path, ...rest }) => rest as Bus));

    intervalRef.current = setInterval(() => {
      simBusesRef.current = simBusesRef.current.map((bus) => {
        const start = bus.path[bus.currentSegment];
        const end = bus.path[bus.currentSegment + 1];

        if (!start || !end) return bus;

        // Calculate step size
        const dLat = end.lat - start.lat;
        const dLng = end.lng - start.lng;
        const mag = Math.sqrt(dLat * dLat + dLng * dLng);
        const step = (0.00035 / (mag || 1)) * bus.direction; // Incremental movement
        
        let newProgress = bus.progress + step;
        let newSegment = bus.currentSegment;
        let newDirection = bus.direction;

        if (newProgress >= 1) {
          newProgress = 0;
          newSegment++;
          if (newSegment >= bus.path.length - 1) {
            newDirection = -1;
            newSegment = bus.path.length - 2;
            newProgress = 1;
          }
        } else if (newProgress <= 0) {
          newProgress = 1;
          newSegment--;
          if (newSegment < 0) {
            newDirection = 1;
            newSegment = 0;
            newProgress = 0;
          }
        }

        const currentLat = start.lat + (end.lat - start.lat) * newProgress;
        const currentLng = start.lng + (end.lng - start.lng) * newProgress;

        return {
          ...bus,
          currentSegment: newSegment,
          progress: newProgress,
          direction: newDirection,
          lat: currentLat,
          lng: currentLng,
          speed: Math.floor(Math.random() * 15) + 30,
          lastUpdated: Date.now()
        };
      });

      setBuses(simBusesRef.current.map(({ path, ...rest }) => rest as Bus));
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDemoMode]);

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode, buses }}>
      {children}
      {/* Floating Demo Mode Control Badge for Presenters/Viva */}
      <div className="fixed bottom-6 left-6 z-[99999] pointer-events-auto">
        <button
          onClick={toggleDemoMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-2xl transition-all duration-500 border ${
            isDemoMode
              ? "bg-[#1565C0]/20 text-[#1565C0] border-[#1565C0]/40 hover:bg-[#1565C0]/35 backdrop-blur-md"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md"
          }`}
          title="Toggle Simulation (Shift + D)"
        >
          {isDemoMode ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Demo Mode Active</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5" />
              <span>Live Database</span>
            </>
          )}
        </button>
      </div>
    </DemoContext.Provider>
  );
};
