import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Power, Map as MapIcon, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { rtdb, auth, db } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function DriverDashboard() {
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [assignedBusId, setAssignedBusId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setAssignedBusId(userDoc.data().busId);
        }
      }
    };
    fetchProfile();
  }, []);

  const startTracking = () => {
    if (!assignedBusId) {
      toast.error("No bus assigned to your profile.");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        
        // Push to Firebase Realtime Database
        const busRef = ref(rtdb, `buses/${assignedBusId}`);
        set(busRef, {
          id: `${assignedBusId.toUpperCase()}-91`,
          lat: latitude,
          lng: longitude,
          speed: speed || 0,
          heading: heading || 0,
          lastUpdated: Date.now(),
          status: "active"
        });
      },
      (error) => {
        toast.error("GPS Error: " + error.message);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    setWatchId(id);
    setIsTracking(true);
    toast.success("Live GPS Stream Started");
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    // Set status to inactive in Firebase
    const busRef = ref(rtdb, "buses/e1");
    set(busRef, { status: "inactive", lastUpdated: Date.now() });
    
    setIsTracking(false);
    toast.info("GPS Stream Paused");
  };

  const toggleTracking = () => {
    if (isTracking) stopTracking();
    else startTracking();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-6 max-w-2xl text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 flex flex-col items-center"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 shadow-lg ${isTracking ? 'bg-emerald-500/20 text-emerald-500 shadow-emerald-500/20' : 'bg-destructive/10 text-destructive'}`}>
            <MapPin className={`w-10 h-10 ${isTracking ? 'animate-bounce' : ''}`} />
          </div>

          <h1 className="text-3xl font-display font-bold mb-2">Driver Portal</h1>
          <p className="text-muted-foreground mb-8">
            {isTracking 
              ? "Live GPS Stream Active. Your location is being monitored." 
              : "GPS Stream Paused. Tap the button to start tracking."}
          </p>

          <Button 
            size="lg" 
            variant={isTracking ? "destructive" : "default"}
            className="w-full h-16 text-lg gap-3 rounded-2xl"
            onClick={toggleTracking}
          >
            <Power className="w-6 h-6" />
            {isTracking ? "Stop Live Stream" : "Start Live Stream"}
          </Button>

          <AnimatePresence>
            {isTracking && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-10 w-full grid grid-cols-2 gap-4"
              >
                <div className="glass-card p-4 border-emerald-500/20">
                  <Navigation className="w-4 h-4 text-emerald-500 mb-2" />
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <p className="font-semibold text-emerald-500">ONLINE</p>
                </div>
                <div className="glass-card p-4 border-primary/20">
                  <MapIcon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Buses Assigned</p>
                  <p className="font-semibold">E1-91</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
