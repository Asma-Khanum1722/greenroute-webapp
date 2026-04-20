import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Power, Map as MapIcon, Navigation, LogOut, Bus as BusIcon, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { rtdb, auth, db } from "@/lib/firebase";
import { ref, set, update } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function DriverDashboard() {
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [driverName, setDriverName] = useState<string>("");
  const [assignedBusId, setAssignedBusId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Create list of 33 buses
  const busPorts = Array.from({ length: 33 }, (_, i) => `e${i + 1}`);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setDriverName(userDoc.data().name);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    if (isTracking) stopTracking();
    await auth.signOut();
    navigate("/login");
  };

  const startTracking = () => {
    if (!assignedBusId) {
      toast.error("Please select a bus before starting your shift.");
      return;
    }
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    toast.success(`Shift Started: Bus ${assignedBusId.toUpperCase()}`);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        
        // Push live data to RTDB
        const busRef = ref(rtdb, `buses/${assignedBusId}`);
        set(busRef, {
          id: `${assignedBusId.toUpperCase()}-91`,
          lat: latitude,
          lng: longitude,
          speed: speed ? Math.round(speed * 3.6) : 0, // Convert to km/h
          heading: heading || 0,
          lastUpdated: Date.now(),
          status: "active",
          driverName: driverName
        });
      },
      (error) => {
        console.error("GPS Error:", error);
        if (error.code === 1) {
          toast.error("Location Permission Denied. Please enable it in browser settings.");
        } else if (error.code === 3) {
          toast.error("GPS is taking too long. Try moving to a window or outdoors.");
        } else {
          toast.error("Lost GPS connection. Retrying...");
        }
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 0, 
        timeout: 10000 
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    // Set status to inactive but keep the marker on map for Admin
    if (assignedBusId) {
      const busRef = ref(rtdb, `buses/${assignedBusId}`);
      update(busRef, { status: "inactive" });
    }

    setIsTracking(false);
    toast.info("Shift Ended. Bus set to Inactive.");
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-24 pb-12 flex-grow container mx-auto px-6">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Navigation className="w-8 h-8 text-primary animate-pulse" />
              Welcome, {driverName || "Driver"}
            </h1>
            <p className="text-muted-foreground mt-2">Sargodha Fleet Operation Dashboard</p>
          </div>
          <Button 
            variant="ghost" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 font-medium"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Assignment Card */}
          <Card className="lg:col-span-1 border-primary/20 glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BusIcon className="w-5 h-5 text-primary" />
                Vehicle Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Operating Bus ID</label>
                <Select 
                  disabled={isTracking} 
                  onValueChange={setAssignedBusId}
                  value={assignedBusId || ""}
                >
                  <SelectTrigger className="w-full bg-foreground/5 h-12 border-primary/10">
                    <SelectValue placeholder="Select Vehicle (E1 - E33)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {busPorts.map((id) => (
                      <SelectItem key={id} value={id}>
                        Electrical Bus {id.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className={`w-full h-16 text-lg font-bold transition-all duration-500 rounded-xl gap-3 ${
                  isTracking 
                  ? "bg-destructive hover:bg-destructive/90 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                  : "bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                }`}
                onClick={isTracking ? stopTracking : startTracking}
              >
                <Power className={`w-6 h-6 ${isTracking ? "animate-pulse" : ""}`} />
                {isTracking ? "END LIVE STREAM" : "START LIVE STREAM"}
              </Button>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="lg:col-span-2 border-primary/10 glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Status & Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl border transition-all duration-500 ${isTracking ? 'bg-primary/10 border-primary/30' : 'bg-muted border-foreground/5'}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">GPS Connection</p>
                  <p className={`text-2xl font-display font-bold ${isTracking ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isTracking ? 'ONLINE' : 'OFFLINE'}
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border transition-all duration-500 ${assignedBusId ? 'bg-primary/10 border-primary/30' : 'bg-muted border-foreground/5'}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Assigned Unit</p>
                  <p className="text-2xl font-display font-bold">
                    {assignedBusId ? assignedBusId.toUpperCase() : 'NONE'}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {isTracking && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-8 flex items-center gap-4 text-primary bg-primary/5 p-4 rounded-xl border border-primary/10"
                  >
                    <MapPin className="w-5 h-5 animate-bounce" />
                    <p className="text-sm font-medium">Your live location is currently being broadcast to the Admin God-View.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  );
}
