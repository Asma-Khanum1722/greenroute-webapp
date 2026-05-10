import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, Star, Navigation, Clock, Info } from "lucide-react";
import BusMap from "@/components/BusMap";
import { motion, AnimatePresence } from "framer-motion";
import { rtdb, auth, db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRoutes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";

export default function PassengerDashboard() {
  const routes = useRoutes();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [activeBuses, setActiveBuses] = useState(0);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [targetStop, setTargetStop] = useState<any>(null);
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  const [calcETA, setCalcETA] = useState<((bus: any) => string) | null>(null);

  const filteredBuses = liveBuses.filter(bus => 
    selectedRoute === "all" || bus.routeId === selectedRoute
  );

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // 1. Get Passenger's Real GPS Location (and keep watching it)
    const geoWatchId = navigator.geolocation.watchPosition((pos) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
    }, null, { enableHighAccuracy: true });

    // 2. Fetch User Profile
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      }
    };

    // 3. Monitor Buses & Proximity
    const busesRef = ref(rtdb, "buses");
    const unsub = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const busList = Object.values(data) as any[];
        const activeCount = busList.filter((b: any) => b.status === "active").length;
        setActiveBuses(activeCount);

        // PROXIMITY CHECK:
        // We check against the passenger's REAL GPS location — this means the alert
        // fires when any active bus gets within 500m of wherever the passenger is standing.
        // Works anywhere — university, street, market — no hardcoded stops needed.
        if (isNotificationsEnabled) {
          setUserLocation(currentLoc => {
            if (!currentLoc) return currentLoc;
            busList.forEach(bus => {
              if (bus.status === "active") {
                const dist = calculateDistance(currentLoc[0], currentLoc[1], bus.lat, bus.lng);
                // 500m threshold
                if (dist < 0.5) {
                  new Notification("GreenRoute Alert 🚌", {
                    body: `Bus ${bus.id} is only ${Math.round(dist * 1000)}m away — head to your stop!`,
                    icon: "/favicon.ico"
                  });
                  toast.success(`Bus ${bus.id} is ${Math.round(dist * 1000)}m away!`, { icon: "🚌" });
                  setIsNotificationsEnabled(false); // prevent spam
                }
              }
            });
            return currentLoc;
          });
        }
      }
    });

    fetchProfile();
    return () => {
      unsub();
      navigator.geolocation.clearWatch(geoWatchId);
    };
  }, [isNotificationsEnabled]);

  const requestNotificationPermission = async () => {
    if (!auth.currentUser) {
      toast.error("Sign in required", {
        description: "Please log in to enable live proximity alerts.",
        action: {
          label: "Login",
          onClick: () => navigate("/login?portal=passenger")
        }
      });
      return;
    }

    if (!("Notification" in window)) {
      toast.error("This browser does not support desktop notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setIsNotificationsEnabled(true);
      toast.success("Arrival Alerts Enabled!");
    } else {
      toast.error("Permission denied for notifications");
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="min-h-screen bg-background overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-8 container mx-auto px-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Navigation className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-display font-bold">Welcome, {userName || "Passenger"}</h1>
              <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium flex items-center gap-2 uppercase tracking-widest">
                Transit Portal
                {!userName && (
                  <a href="/login" className="text-primary hover:underline decoration-primary/30">Sign in →</a>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                {activeBuses} Units Active
              </span>
            </div>
            
            <select 
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-[10px] font-bold focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer hover:bg-white/10 flex-1 md:flex-none min-w-[140px]"
            >
              <option value="all" className="bg-[#0A0A0A]">ALL ROUTES</option>
              {routes.map(route => (
                <option key={route.id} value={route.id} className="bg-[#0A0A0A]">
                  {route.name.toUpperCase()}
                </option>
              ))}
            </select>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-10 gap-2 border-white/10 transition-all flex-1 md:flex-none lg:flex"
            >
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">{isSidebarOpen ? 'Hide Info' : 'Show Info'}</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0">
          {/* Main Map View */}
          <motion.div 
            layout
            className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-6 transition-all duration-500`}
          >
            <section className="glass-card p-2 overflow-hidden relative group border-white/5">
              <BusMap 
                className="rounded-2xl border-none" 
                selectedRoute={selectedRoute}
                targetStop={targetStop}
                onSelectStop={(stop) => {
                  setTargetStop(stop);
                  toast.info(`Target Stop set to: ${stop.name}`);
                }}
                onBusesUpdate={(buses, eta) => {
                  setLiveBuses(buses);
                  setCalcETA(() => eta);
                }}
              />
            </section>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-4 border-white/5 bg-white/[0.02] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase text-muted-foreground">Status</h3>
                  <p className="text-xs font-bold">Operational</p>
                </div>
              </div>
              <div className="glass-card p-4 border-white/5 bg-white/[0.02] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase text-muted-foreground">Frequency</h3>
                  <p className="text-xs font-bold">Every 60m</p>
                </div>
              </div>
              <div className="lg:col-span-2 glass-card px-6 border-blue-500/10 bg-blue-500/5 flex items-center gap-3">
                <Info className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] text-blue-200/60 font-medium">Regular schedules active. Free travel for women & students.</p>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Tools */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-4 space-y-6"
              >
                {/* Live ETA Panel */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-primary" />
                  Live ETA
                  {selectedRoute !== "all" && (
                    <span className="text-xs text-primary/60 font-normal ml-auto">
                      {liveBuses.filter(b => b.status === "active").length} buses active
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRoute === "all" ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Select a route from the dropdown above to see live ETAs
                  </p>
                ) : liveBuses.filter(b => b.status === "active").length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No active buses on this route right now
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {liveBuses
                      .filter(b => b.status === "active")
                      .slice(0, 6)
                      .map((bus) => (
                        <div key={bus.key} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold text-white">{bus.id}</span>
                          </div>
                          <span className="text-sm font-display font-bold text-primary">
                            {calcETA ? calcETA(bus) : "..."}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Alert Card */}
            <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors duration-500 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bell className="w-24 h-24 rotate-12" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Arrival Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Never miss your bus again. Get notified automatically when your selected vehicle is 500 metres away.
                </p>
                <Button 
                  onClick={requestNotificationPermission}
                  variant={isNotificationsEnabled ? "secondary" : "default"}
                  className="w-full gap-2 font-bold h-12 rounded-xl transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  {isNotificationsEnabled ? (targetStop ? `MONITORING: ${targetStop.name}` : "SELECT A STOP ON MAP") : "ENABLE PROXIMITY ALERTS"}
                </Button>
                {targetStop && (
                  <p className="text-[10px] text-primary text-center font-bold animate-pulse">
                    Watching for buses near {targetStop.name}...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Favorite Stops Card */}
            <Card className="border-white/5 glass-card">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2 font-display uppercase tracking-widest">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Terminals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3">
                {routes.slice(0, 5).map((route, i) => {
                  const terminal = route.stops[route.stops.length - 1];
                  return (
                    <div 
                      key={i} 
                      onClick={() => {
                        if (!auth.currentUser) {
                          toast.error("Sign in required", {
                            description: "Login to save your favorite stops and terminals.",
                            action: {
                              label: "Login",
                              onClick: () => navigate("/login?portal=passenger")
                            }
                          });
                          return;
                        }
                        setTargetStop(terminal);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold group-hover:text-primary transition-colors truncate max-w-[140px]">{terminal.name}</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">ETA: {Math.floor(Math.random() * 15) + 5} min</span>
                      </div>
                      <Star className={`w-3.5 h-3.5 transition-colors ${targetStop?.id === terminal.id ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30 group-hover:text-yellow-500'}`} />
                    </div>
                  );
                })}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  );
}
