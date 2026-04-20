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

export default function PassengerDashboard() {
  const [userName, setUserName] = useState("");
  const [activeBuses, setActiveBuses] = useState(0);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
    // 1. Get User Initial Location
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
    });

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

        // Check proximity for active buses if enabled
        if (isNotificationsEnabled && userLocation) {
          busList.forEach(bus => {
            if (bus.status === "active") {
              const dist = calculateDistance(userLocation[0], userLocation[1], bus.lat, bus.lng);
              if (dist < 1.5) {
                new Notification("GreenRoute Alert 🚌", {
                  body: `Bus ${bus.id} is only ${dist.toFixed(1)}km away! Head to the stop.`,
                  icon: "/favicon.ico"
                });
                // Disable to prevent spamming
                setIsNotificationsEnabled(false); 
              }
            }
          });
        }
      }
    });

    fetchProfile();
    return () => unsub();
  }, [isNotificationsEnabled, userLocation]);

  const requestNotificationPermission = async () => {
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

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 container mx-auto px-6">
        <header className="mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-display font-bold">Welcome, {userName || "Passenger"}</h1>
            <p className="text-muted-foreground mt-2 font-medium">Your Sargodha Smart Transit Portal is active.</p>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Map View */}
          <div className="lg:col-span-2 space-y-8">
            <section className="glass-card p-4 overflow-hidden relative group">
              <div className="absolute top-8 left-8 z-20 flex gap-2">
                <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">{activeBuses} Buses Active</span>
                </div>
              </div>
              <BusMap className="h-[600px] rounded-xl border-none" />
            </section>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
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
                  Never miss your bus again. Get notified automatically when your selected vehicle is 1.5km away.
                </p>
                <Button 
                  onClick={requestNotificationPermission}
                  className={`w-full gap-2 font-bold h-12 rounded-xl transition-all ${isNotificationsEnabled ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary/90'}`}
                >
                  <Navigation className="w-4 h-4" />
                  {isNotificationsEnabled ? "ALERTS ACTIVE" : "ENABLE PROXIMITY ALERTS"}
                </Button>
              </CardContent>
            </Card>

            {/* Favorite Stops Card */}
            <Card className="border-white/5 glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 font-display">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Frequent Terminals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Sargodha General Bus Stand", time: "Every 15m" },
                  { name: "University Road Stop", time: "Every 20m" },
                  { name: "Satellite Town Terminal", time: "Every 10m" }
                ].map((stop, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                    <div>
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">{stop.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {stop.time}
                      </p>
                    </div>
                    <Star className="w-4 h-4 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* News Alert */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3 items-start">
              <Info className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
              <p className="text-xs text-blue-200/80 leading-relaxed">
                <strong>Service Update:</strong> All electrical buses are currently operating on winter schedules. Free travel remains active for seniors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
