import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, Star, Navigation, Clock, Info, Lock, Bus as BusIcon } from "lucide-react";
import BusMap from "@/components/BusMap";
import { motion } from "framer-motion";
import { rtdb, auth, db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRoutes, getRouteDistanceAndETA } from "@/lib/routes";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/lib/DemoContext";

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

const isActuallyActive = (bus: any, isDemoMode = false) => {
  if (bus.status === "inactive") return false;
  if ((Date.now() - (bus.lastUpdated || 0)) > 60000) return false;
  if (!bus.lat || !bus.lng) return false;
  if (bus.lat < 23 || bus.lat > 37) return false;
  if (bus.lng < 60 || bus.lng > 77) return false;
  if (!isDemoMode && !bus.driverEmail) return false;
  return true;
};

export default function PassengerDashboard() {
  const routes = useRoutes();
  const navigate = useNavigate();
  const { isDemoMode, buses: demoBuses } = useDemo();
  const [userName, setUserName] = useState("");
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("greenroute_alerts") === "true";
    }
    return false;
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [targetStop, setTargetStop] = useState<any>(null); // Boarding Stop
  const [destinationStop, setDestinationStop] = useState<any>(null); // Destination Stop
  const canUseNotificationApi = typeof window !== "undefined" && "Notification" in window;
  const [allBuses, setAllBuses] = useState<any[]>([]);
  const liveBuses = allBuses;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getNearestStopForRoute = (route: any) => {
    if (!route || !route.stops || route.stops.length === 0) return null;
    if (targetStop && route.stops.some((stop: any) => stop.id === targetStop.id)) {
      return targetStop;
    }
    if (!userLocation) {
      return route.stops[0];
    }
    let closestStop = route.stops[0];
    let minDistance = Infinity;
    for (const stop of route.stops) {
      const distance = calculateDistance(userLocation[0], userLocation[1], stop.lat, stop.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestStop = stop;
      }
    }
    return closestStop;
  };

  const getNearestStopsForRoute = (route: any, maxStops = 6) => {
    if (!route || !route.stops || route.stops.length === 0) return [];
    const stopsWithDistance = route.stops.map((stop: any) => ({
      stop,
      distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], stop.lat, stop.lng) : 0
    }));
    return stopsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxStops)
      .map(item => item.stop);
  };

  const getAllNearestStops = () => {
    if (!userLocation) return [];
    return routes.flatMap(route => {
      if (!route || !route.stops) return [];
      return route.stops.map((stop: any) => ({
        ...stop,
        routeId: route.id,
        routeName: route.name,
        routeColor: route.color,
        distance: calculateDistance(userLocation[0], userLocation[1], stop.lat, stop.lng)
      }));
    }).sort((a: any, b: any) => a.distance - b.distance).slice(0, 15);
  };

  // Reset stops if selected route changes and doesn't contain them
  useEffect(() => {
    if (selectedRoute === "all") return;
    const route = routes.find(r => r.id === selectedRoute);
    if (!route || !route.stops) return;
    
    if (targetStop && !route.stops.some((stop: any) => stop.id === targetStop.id)) {
      setTargetStop(null);
    }
    if (destinationStop && !route.stops.some((stop: any) => stop.id === destinationStop.id)) {
      setDestinationStop(null);
    }
  }, [selectedRoute, targetStop, destinationStop, routes]);

  const hasSelectedStop = Boolean(targetStop);
  const walkingDistanceKm = hasSelectedStop && userLocation
    ? calculateDistance(userLocation[0], userLocation[1], targetStop.lat, targetStop.lng)
    : null;
  const walkingTimeMinutes = walkingDistanceKm !== null
    ? Math.max(1, Math.round((walkingDistanceKm / 5) * 60))
    : null;
  const boardingStopLabel = hasSelectedStop ? "Selected boarding stop" : "Select boarding stop";
  const boardingStopName = hasSelectedStop ? targetStop.name : "Choose one on the map";
  const selectedRouteObj = selectedRoute !== "all" ? routes.find(r => r.id === selectedRoute) : null;
  const nearestRouteStops = selectedRouteObj ? getNearestStopsForRoute(selectedRouteObj) : [];

  const notifiedBuses = useRef<Record<string, number>>({});
  const prevDistances = useRef<Record<string, number>>({});
  const userLocationRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const [nearbyBuses, setNearbyBuses] = useState<{bus: any, dist: number, eta: string}[]>([]);

  // Format distance (meters if < 1km, km with decimal if >= 1km)
  const formatDist = (km: number) => km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(2)}km`;

  // Synthesize beautiful transit alert sound fallback
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = ctx.currentTime;
      playTone(392.00, now, 0.3); // G4
      playTone(523.25, now + 0.2, 0.5); // C5
    } catch (err) {
      console.error("Audio chime error:", err);
    }
  };

  const showArrivalNotification = (busId: string, stopName: string, dist: number) => {
    const message = `Bus ${busId} is ${formatDist(dist)} from ${stopName}!`;
    playNotificationSound();
    if (canUseNotificationApi) {
      try {
        new Notification("GreenRoute Alert 🚌", {
          body: message,
          icon: "/favicon.ico"
        });
      } catch (err) {
        console.error("Notification API error:", err);
      }
    }
    toast.success(message, { 
      icon: "🚌",
      duration: 10000,
      description: "Arrival alerts playing standard sound chime."
    });
  };

  const activeBuses = liveBuses.filter(bus => isActuallyActive(bus, isDemoMode)).length;
  const activeRouteBuses = selectedRoute !== "all"
    ? liveBuses.filter(bus => isActuallyActive(bus, isDemoMode) && bus.routeId === selectedRoute).length
    : activeBuses;

  // Track login state for feature-gating
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      if (user) {
        getDoc(doc(db, "users", user.uid)).then((d) => {
          if (d.exists()) setUserName(d.data().name);
        });
      } else {
        setUserName("");
      }
    });
    return () => unsub();
  }, []);



  // Persist alerts state to localStorage
  useEffect(() => {
    localStorage.setItem("greenroute_alerts", isNotificationsEnabled ? "true" : "false");
  }, [isNotificationsEnabled]);

  // Auto-enable alerts when stop is selected + logged in
  useEffect(() => {
    if (!isLoggedIn || !targetStop || !canUseNotificationApi) return;
    if (isNotificationsEnabled) return;

    if (Notification.permission === "granted") {
      setIsNotificationsEnabled(true);
      toast.success(`Monitoring buses near ${targetStop.name}`, { icon: "🔔" });
    }
  }, [targetStop, isLoggedIn]);


  const calculateETAForTerminal = (bus: any, terminal: any) => {
    const route = routes.find(r => r.id === bus.routeId);
    if (route && route.stops && route.stops.length > 0) {
      const stop = route.stops.find(s => s.id === terminal.id || (Math.abs(s.lat - terminal.lat) < 0.0001 && Math.abs(s.lng - terminal.lng) < 0.0001));
      if (stop) {
        const calcs = getRouteDistanceAndETA(bus, stop, route);
        return `${calcs.etaMinutes} mins`;
      }
    }
    const rawDist = calculateDistance(bus.lat, bus.lng, terminal.lat, terminal.lng);
    const mins = Math.max(1, Math.round((rawDist / 40) * 60));
    return `${mins} mins`;
  };

  // 1. Get Passenger's Real GPS Location
  useEffect(() => {
    const geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        userLocationRef.current = coords;
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(geoWatchId);
  }, []);

  // 2. Monitor Firebase Buses / Demo buses and update allBuses state
  useEffect(() => {
    if (isDemoMode) {
      setAllBuses(demoBuses);
      return;
    }

    const busesRef = ref(rtdb, "buses");
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const busList = Object.values(data) as any[];
        setAllBuses(busList);
      } else {
        setAllBuses([]);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode, demoBuses]);

  // 3. Live nearby buses updating every 8 seconds (with immediate call)
  useEffect(() => {
    const calculate = () => {
      const currentLoc = userLocationRef.current;
      if (!currentLoc || !targetStop) {
        setNearbyBuses([]);
        return;
      }
      const results = liveBuses
        .filter(bus => isActuallyActive(bus, isDemoMode))
        .map(bus => {
          const route = routes.find(r => r.id === bus.routeId);
          if (!route || !route.stops || route.stops.length === 0) {
            const dist = calculateDistance(currentLoc[0], currentLoc[1], bus.lat, bus.lng);
            return {
              bus: { ...bus, calcTargetStopName: "User Proximity" },
              dist,
              eta: "Select a stop"
            };
          }

          const calcTargetStop = targetStop;
          const calcs = getRouteDistanceAndETA(bus, calcTargetStop, route);
          return {
            bus: {
              ...bus,
              calcTargetStopName: calcTargetStop.name
            },
            dist: calcs.distanceKm,
            eta: calcs.etaMinutes <= 1 && calcs.distanceKm < 0.1 ? "Arriving" : `${calcs.etaMinutes} min`
          };
        })
        .sort((a, b) => a.dist - b.dist);
      setNearbyBuses(results);
    };

    calculate(); // immediate
    const interval = setInterval(calculate, 8000);
    return () => clearInterval(interval);
  }, [liveBuses, routes, targetStop]);

  // 4. Proximity Notification alerts
  const toggleAlerts = () => {
    if (!isLoggedIn) {
      toast.error("Sign in required", {
        description: "Please log in to enable bus alerts.",
        action: { label: "Login", onClick: () => navigate("/login?portal=passenger") }
      });
      return;
    }
    if (!targetStop) {
      toast.error("Select a boarding stop first");
      return;
    }

    if (isNotificationsEnabled) {
      setIsNotificationsEnabled(false);
      toast.info("Bus alerts paused", { icon: "🔕" });
      return;
    }

    if (!canUseNotificationApi) {
      toast.error("Your browser doesn't support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      setIsNotificationsEnabled(true);
      toast.success(`Monitoring buses near ${targetStop.name}`, { icon: "🔔" });
      scanArrivalNotifications(true);
    } else if (Notification.permission === "denied") {
      toast.error("Notifications blocked. Allow them in browser settings.");
    } else {
      Notification.requestPermission().then(perm => {
        if (perm === "granted") {
          setIsNotificationsEnabled(true);
          toast.success(`Bus alerts activated for ${targetStop.name}`, { icon: "🔔" });
          scanArrivalNotifications(true);
        } else {
          toast.error("Please allow notifications in browser settings");
        }
      });
    }
  };

  const liveBusesRef = useRef<any[]>([]);
  useEffect(() => {
    liveBusesRef.current = liveBuses;
  }, [liveBuses]);

  const scanArrivalNotifications = (enabled = isNotificationsEnabled) => {
    if (!enabled) return;
    const currentLoc = userLocationRef.current;
    if (!currentLoc || !targetStop) return;
    const now = Date.now();
    const boardingRouteId = selectedRoute !== "all"
      ? selectedRoute
      : routes.find(r => r.stops.some((stop: any) => stop.id === targetStop.id))?.id;

    liveBusesRef.current
      .filter(bus => isActuallyActive(bus, isDemoMode) && (boardingRouteId ? bus.routeId === boardingRouteId : true))
      .forEach(bus => {
        const route = routes.find(r => r.id === bus.routeId);
        let dist = 0;
        let stopName = targetStop.name;

        if (route && route.stops && route.stops.length > 0 && route.id === boardingRouteId) {
          const calcs = getRouteDistanceAndETA(bus, targetStop, route);
          dist = calcs.distanceKm;
        } else {
          dist = calculateDistance(currentLoc[0], currentLoc[1], bus.lat, bus.lng);
          stopName = "your boarding stop";
        }

        const prevDist = prevDistances.current[bus.id] || Infinity;
        prevDistances.current[bus.id] = dist;

        // Reset cooldown if bus moved away (so it can notify again next approach)
        if (prevDist < 0.5 && dist >= 0.5) {
          delete notifiedBuses.current[bus.id];
        }

        if (dist < 0.5 && (now - (notifiedBuses.current[bus.id] || 0)) > 60000) {
          notifiedBuses.current[bus.id] = now;
          showArrivalNotification(bus.id, stopName, dist);
        }
      });
  };

  useEffect(() => {
    const interval = setInterval(scanArrivalNotifications, 15000);
    scanArrivalNotifications();
    return () => clearInterval(interval);
  }, [isNotificationsEnabled, routes, selectedRoute, targetStop]);

  return (
    <main className="h-screen overflow-hidden bg-background">
      <Navbar />
      <div className="h-full pt-24 min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0 overflow-hidden">
          <aside className="w-[420px] min-w-[320px] h-full overflow-y-auto bg-black/25 backdrop-blur-xl border-r border-white/5 p-6 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-display font-bold">Welcome, {userName || "Passenger"}</h1>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-muted-foreground flex flex-wrap gap-2 items-center">
                    Transit Portal
                    {!userName && (
                      <a href="/login" className="text-primary hover:underline decoration-primary/30">Sign in →</a>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Route</label>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 text-[10px] font-bold focus:ring-2 focus:ring-primary outline-none transition-all hover:bg-white/10"
                  >
                    <option value="all" className="bg-[#0A0A0A]">ALL ROUTES</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id} className="bg-[#0A0A0A]">
                        {route.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Active buses</p>
                    <p className="text-2xl font-display font-extrabold text-white">{activeBuses}</p>
                  </div>
                  <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Selected route</p>
                    <p className="text-sm font-bold text-white truncate">{selectedRouteObj?.name || 'All routes'}</p>
                  </div>
                </div>

                { !hasSelectedStop ? (
                  <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4 text-[11px] font-semibold text-primary">
                    Select your boarding stop for live ETA, distance and alerts. The bus is tracked to the stop, not to your home.
                  </div>
                ) : (
                  <div className="rounded-3xl border border-emerald-200/10 bg-emerald-500/5 p-4 text-[11px] font-semibold text-emerald-200">
                    Boarding stop selected: <span className="text-white">{boardingStopName}</span>. ETA and distance are now calculated to this stop.
                  </div>
                )}
              </div>
            </div>

            <Card className="border-white/10 bg-white/5 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-display uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-primary" />
                  Configure Your Trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRouteObj ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Boarding Point
                      </label>
                      <div className="max-h-40 overflow-y-auto grid gap-1.5 pr-1">
                        {selectedRouteObj.stops.map((stop: any) => (
                          <button
                            key={`board-${stop.id}`}
                            onClick={() => setTargetStop(stop)}
                            className={`text-left px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all ${
                              targetStop?.id === stop.id
                                ? 'border-primary/40 bg-primary/15 text-primary'
                                : 'border-white/5 bg-white/[0.02] hover:border-primary/20 hover:bg-primary/5'
                            }`}
                          >
                            {stop.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Destination Point (Optional)
                      </label>
                      <div className="max-h-40 overflow-y-auto grid gap-1.5 pr-1">
                        {selectedRouteObj.stops.map((stop: any) => {
                          const isBoarding = targetStop?.id === stop.id;
                          return (
                            <button
                              key={`dest-${stop.id}`}
                              disabled={isBoarding}
                              onClick={() => setDestinationStop(stop)}
                              className={`text-left px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all ${
                                isBoarding ? 'opacity-40 cursor-not-allowed border-none' :
                                destinationStop?.id === stop.id
                                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                                  : 'border-white/5 bg-white/[0.02] hover:border-emerald-500/20 hover:bg-emerald-500/5'
                              }`}
                            >
                              {stop.name} {isBoarding && "(Boarding Stop)"}
                            </button>
                          );
                        })}
                      </div>
                      {destinationStop && (
                        <button
                          onClick={() => setDestinationStop(null)}
                          className="mt-2 text-[9px] font-bold text-rose-400 hover:underline block ml-auto"
                        >
                          Clear Destination
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-muted-foreground">
                      {userLocation ? "Nearest stops across all routes:" : "Enable GPS to see nearest stops, or select a route first."}
                    </p>
                    {userLocation && (
                      <div className="max-h-72 overflow-y-auto grid gap-2">
                        {getAllNearestStops().map((stop: any) => (
                          <button
                            key={stop.id}
                            onClick={() => {
                              setTargetStop(stop);
                              setSelectedRoute(stop.routeId);
                            }}
                            className={`text-left px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all ${
                              targetStop?.id === stop.id
                                ? 'border-primary/40 bg-primary/15 text-primary'
                                : 'border-white/10 bg-white/5 hover:border-primary/20 hover:bg-primary/10'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col">
                                <span>{stop.name}</span>
                                <span className="text-[8px] mt-0.5 font-bold" style={{ color: stop.routeColor }}>
                                  {stop.routeName}
                                </span>
                              </div>
                              <span className="text-[9px] text-muted-foreground shrink-0">
                                {stop.distance < 1 ? `${Math.round(stop.distance * 1000)}m` : `${stop.distance.toFixed(1)}km`}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-primary animate-pulse" />
                  Live Nearby Buses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasSelectedStop ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] gap-3">
                    <BusIcon className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground max-w-[220px]">
                      Select your boarding stop first. Tap a stop marker on the map or choose one from the closest route stops list below to view exact ETA and distance.
                    </p>
                    {selectedRouteObj ? (
                      <div className="w-full text-left px-4">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Closest stops on {selectedRouteObj.name}</div>
                        <div className="grid gap-2">
                          {nearestRouteStops.map((stop: any) => (
                            <button
                              key={stop.id}
                              onClick={() => setTargetStop(stop)}
                              className="text-left px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-[11px] font-semibold hover:border-primary/20 hover:bg-primary/10"
                            >
                              {stop.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground px-4">
                        Choose a route first, then tap the stop you want to board on the map.
                      </p>
                    )}
                  </div>
                ) : activeRouteBuses === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-rose-500/20 rounded-xl bg-rose-500/5 gap-3">
                    <BusIcon className="w-8 h-8 text-rose-400/70" />
                    <p className="text-xs text-rose-100 max-w-[240px]">
                      No active buses are broadcasting yet for the selected route. Ask the driver to start the live stream or try again shortly.
                    </p>
                  </div>
                ) : nearbyBuses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    <BusIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No active buses currently heading to your selected boarding stop.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const closest = nearbyBuses[0];
                      const dotColor = closest.dist < 0.5 ? 'bg-emerald-500' : closest.dist < 2 ? 'bg-amber-500' : 'bg-slate-500';
                      return (
                        <div className="relative overflow-hidden p-4 rounded-2xl bg-white/[0.04] border border-primary/20 shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Closest Bus
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: dotColor }} />
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
                              </span>
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Live
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <h4 className="text-xl font-display font-extrabold text-white">
                                {closest.bus.id}
                              </h4>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {closest.bus.routeName || "Unassigned Route"}
                              </p>
                              <p className="text-[9px] text-primary/80 font-semibold uppercase tracking-wider truncate max-w-[150px] mt-0.5">
                                Boarding: {closest.bus.calcTargetStopName || "Nearest Stop"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-display font-black text-primary flex items-center justify-end gap-1">
                                <motion.span
                                  key={closest.dist}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="transition-all duration-300"
                                >
                                  {formatDist(closest.dist)}
                                </motion.span>
                              </div>
                              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                ETA: {closest.eta}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {nearbyBuses.length > 1 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {nearbyBuses.slice(1, 6).map(({ bus, dist, eta }) => {
                          const dotColor = dist < 0.5 ? 'bg-emerald-500' : dist < 2 ? 'bg-amber-500' : 'bg-slate-500';
                          return (
                            <div key={bus.key || bus.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-300">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative flex h-2 w-2 shrink-0">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: dotColor }} />
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
                                </div>
                                <div className="truncate">
                                  <span className="text-xs font-bold text-white block">{bus.id}</span>
                                  <span className="text-[9px] text-muted-foreground truncate block max-w-[120px]">
                                    {bus.routeName || "Unassigned"}
                                  </span>
                                  <span className="text-[8px] text-primary/70 font-semibold truncate block max-w-[120px] mt-0.5 uppercase tracking-wider">
                                    Boarding: {bus.calcTargetStopName || "Nearest Stop"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <motion.span
                                  key={dist}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-xs font-display font-bold text-white block"
                                >
                                  {formatDist(dist)}
                                </motion.span>
                                <span className="text-[9px] font-semibold text-primary block">
                                  {eta}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

             <Card className="border-white/10 bg-white/[0.03] overflow-hidden">
               <CardHeader className="pb-2">
                 <CardTitle className="flex items-center gap-2 text-base font-display uppercase tracking-widest">
                   <Bell className="w-4 h-4 text-primary animate-pulse" />
                   Notification Alerts
                   {!isLoggedIn && <Lock className="w-3.5 h-3.5 text-white/30 ml-auto" />}
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {!isLoggedIn ? (
                   <div className="flex flex-col items-center gap-3 py-4">
                     <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                       <Lock className="w-4 h-4 text-white/30" />
                     </div>
                     <p className="text-[11px] text-white/40 text-center">Sign in to get bus arrival alerts</p>
                     <button
                       onClick={() => navigate("/login?portal=passenger")}
                       className="text-[11px] font-bold text-primary hover:underline transition-all"
                     >
                       Sign In →
                     </button>
                   </div>
                 ) : !targetStop ? (
                   <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                     <Bell className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                     <p className="text-[10px] text-muted-foreground">
                       Select a boarding stop to activate arrival alerts.
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <div className={`flex items-center justify-between p-3 rounded-xl border ${
                       isNotificationsEnabled
                         ? 'border-emerald-500/20 bg-emerald-500/5'
                         : 'border-white/10 bg-white/[0.02]'
                     }`}>
                       <div className="flex items-center gap-2.5">
                         <span className="relative flex h-2 w-2">
                           {isNotificationsEnabled && (
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                           )}
                           <span className={`relative inline-flex rounded-full h-2 w-2 ${
                             isNotificationsEnabled ? 'bg-emerald-500' : 'bg-white/20'
                           }`} />
                         </span>
                         <div>
                           <p className="text-[10px] font-bold uppercase tracking-wider">
                             {isNotificationsEnabled ? 'Monitoring' : 'Paused'}
                           </p>
                           <p className="text-[9px] text-muted-foreground truncate max-w-[140px]">
                             {targetStop.name}
                           </p>
                         </div>
                       </div>
                       <button
                         onClick={toggleAlerts}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                           isNotificationsEnabled
                             ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                             : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                         }`}
                       >
                         {isNotificationsEnabled ? 'Pause' : 'Resume'}
                       </button>
                     </div>
                     <p className="text-[9px] text-muted-foreground text-center">
                       {isNotificationsEnabled
                         ? "You'll be notified when a bus is within 500m"
                         : "Tap Resume to authorize alerts"}
                     </p>
                   </div>
                 )}
               </CardContent>
             </Card>

             <Card className="border-white/5 glass-card">
               <CardHeader className="py-3">
                 <CardTitle className="text-sm flex items-center gap-2 font-display uppercase tracking-widest">
                   <Star className="w-4 h-4 text-yellow-500" />
                   Terminals
                   {!isLoggedIn && <Lock className="w-3.5 h-3.5 text-white/30 ml-auto" />}
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-2 px-3 pb-3">
                 {!isLoggedIn ? (
                   <div className="flex flex-col items-center gap-3 py-4">
                     <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                       <Lock className="w-4 h-4 text-white/30" />
                     </div>
                     <p className="text-[11px] text-white/40 text-center">Sign in to save favourite terminals</p>
                     <button
                       onClick={() => navigate("/login?portal=passenger")}
                       className="text-[11px] font-bold text-primary hover:underline transition-all"
                     >
                       Sign In →
                     </button>
                   </div>
                 ) : (
                   routes.slice(0, 5).map((route, i) => {
                     const terminal = route.stops[route.stops.length - 1];
                     const closestActiveBus = liveBuses
                       .filter(b => isActuallyActive(b, isDemoMode))
                       .sort((a, b) =>
                         calculateDistance(a.lat, a.lng, terminal.lat, terminal.lng) -
                         calculateDistance(b.lat, b.lng, terminal.lat, terminal.lng)
                       )[0];
 
                     return (
                       <div 
                         key={i} 
                         onClick={() => setTargetStop(terminal)}
                         className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                       >
                         <div className="flex flex-col">
                           <span className="text-[11px] font-bold group-hover:text-primary transition-colors truncate max-w-[140px]">{terminal.name}</span>
                           <span className="text-[9px] text-muted-foreground mt-0.5">
                             {closestActiveBus ? calculateETAForTerminal(closestActiveBus, terminal) : '—'}
                           </span>
                         </div>
                         <Star className={`w-3.5 h-3.5 transition-colors ${targetStop?.id === terminal.id ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30 group-hover:text-yellow-500'}`} />
                       </div>
                     );
                   })
                 )}
               </CardContent>
             </Card>
          </aside>

          <section className="flex-1 h-full min-h-0 relative overflow-hidden">
            <BusMap 
              className="h-full w-full rounded-none border-none"
              selectedRoute={selectedRoute}
              targetStop={targetStop}
              onSelectStop={(stop) => {
                setTargetStop(stop);
                const stopRoute = routes.find(r => r.stops.some((s: any) => s.id === stop.id));
                if (stopRoute && selectedRoute === "all") setSelectedRoute(stopRoute.id);
                toast.info(`Boarding Stop set to: ${stop.name}`);
              }}
              destinationStop={destinationStop}
              onSelectDestinationStop={(stop) => {
                setDestinationStop(stop);
                toast.info(`Destination Stop set to: ${stop.name}`);
              }}
            />

            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
              <div className="grid gap-3 xl:grid-cols-2">
                <div className="pointer-events-auto rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl text-white shadow-2xl">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Trip Info</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {targetStop ? targetStop.name : 'Boarding stop not selected'}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {destinationStop ? `Destination: ${destinationStop.name}` : 'Choose a destination in the sidebar or on the map'}
                  </p>
                </div>
                <div className="pointer-events-auto rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl text-white shadow-2xl">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Walk Time</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {walkingTimeMinutes ? `~${walkingTimeMinutes} min walk` : 'Select a boarding stop'}
                  </p>
                  {walkingDistanceKm !== null && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDist(walkingDistanceKm)} from your current location
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
