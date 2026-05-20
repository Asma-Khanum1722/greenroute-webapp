import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Power, Navigation, Bus as BusIcon, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SARGODHA_ROUTES } from "@/lib/routes";
import { trackingService } from "@/lib/trackingService";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function DriverDashboard() {
  // VIVA-NOTE: We use 'useState' to manage the dynamic parts of the UI.
  // We synchronize these local UI states with our global background trackingService.
  const [isTracking, setIsTracking] = useState(false);
  const [driverName, setDriverName] = useState<string>("");
  const [assignedBusId, setAssignedBusId] = useState<string | null>(null);
  const [assignedRouteId, setAssignedRouteId] = useState<string>("r1"); // Default to R1 Bhera Express
  const [locationPermission, setLocationPermission] = useState<PermissionState | "unsupported">("prompt");
  const navigate = useNavigate();

  // VIVA-NOTE: Browsers block GPS on non-HTTPS sites. We must warn the user.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("unsupported");
      return;
    }

    // Check if we are on a secure context (localhost or HTTPS)
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      toast.warning("Insecure Context: Mobile GPS requires HTTPS. Check the 'Chrome Hack' in console.");
      console.warn("DEV TIP: Go to chrome://flags/#unsafely-treat-insecure-origin-as-secure and add http://192.168.1.9:8080");
    }
  }, []);

  // Create list of 33 buses
  const busPorts = Array.from({ length: 33 }, (_, i) => `e${i + 1}`);

  // FETCH PROFILE: On component mount, we grab the logged-in driver's name from Firestore.
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

  // SUBSCRIBE TO PERSISTENT TRACKING SERVICE: 
  // Keeps the dashboard UI updated with the current background tracking state.
  useEffect(() => {
    const unsubscribe = trackingService.subscribe((session) => {
      setIsTracking(session.isTracking);
      if (session.isTracking) {
        setAssignedBusId(session.assignedBusId);
        setAssignedRouteId(session.assignedRouteId);

        // Auto-resume tracking loops if session exists in memory (from localStorage)
        // but background tasks have not started yet (e.g. after refresh/code-reload).
        if (session.watchId === null && session.heartbeatInterval === null) {
          trackingService.resume((error) => {
            if (error.code === error.PERMISSION_DENIED) {
              toast.error("GPS Permission Denied. Stopping shift.");
              trackingService.stop();
            } else {
              toast.warning("GPS signal weak. Reconnecting...");
            }
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    // Stop persistent tracking first
    trackingService.stop();
    await auth.signOut();
    navigate("/login");
  };

  const startTracking = () => {
    if (!assignedBusId) {
      toast.error("Please select a bus before starting your shift.");
      return;
    }
    
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device.");
      return;
    }

    trackingService.start(
      assignedBusId,
      assignedRouteId,
      driverName,
      auth.currentUser?.email || "",
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("GPS Permission Denied. Stopping shift.");
          trackingService.stop();
        } else {
          toast.warning("GPS signal weak. Reconnecting...");
        }
      }
    );
    
    toast.success(`Shift Started: Bus ${assignedBusId.toUpperCase()}`);
  };

  const stopTracking = () => {
    trackingService.stop();
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

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Assigned Route</label>
                <Select 
                  disabled={isTracking} 
                  onValueChange={setAssignedRouteId}
                  value={assignedRouteId}
                >
                  <SelectTrigger className="w-full bg-foreground/5 h-12 border-primary/10">
                    <SelectValue placeholder="Select Your Route" />
                  </SelectTrigger>
                  <SelectContent>
                    {SARGODHA_ROUTES.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                variant={isTracking ? "destructive" : "default"}
                className="w-full h-16 text-lg font-bold transition-all duration-500 rounded-xl gap-3"
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
                    <p className="text-sm font-medium">Your live location is currently being broadcast.</p>
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
