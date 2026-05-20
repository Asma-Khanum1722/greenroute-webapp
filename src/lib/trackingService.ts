import { rtdb } from "@/lib/firebase";
import { ref, set, update, onDisconnect } from "firebase/database";
import { SARGODHA_ROUTES } from "./routes";

const GBS_TERMINAL = { lat: 32.0755605, lng: 72.6976644 };

export interface TrackingSession {
  isTracking: boolean;
  assignedBusId: string | null;
  assignedRouteId: string;
  driverName: string;
  driverEmail: string;
  watchId: number | null;
  heartbeatInterval: any | null;
  lastWrittenPos: { lat: number, lng: number } | null;
}

const LOCAL_STORAGE_KEY = "greenroute_tracking_session";

const loadSessionFromStorage = (): TrackingSession => {
  if (typeof window === "undefined") {
    return {
      isTracking: false,
      assignedBusId: null,
      assignedRouteId: "r1",
      driverName: "",
      driverEmail: "",
      watchId: null,
      heartbeatInterval: null,
      lastWrittenPos: null
    };
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        isTracking: parsed.isTracking || false,
        assignedBusId: parsed.assignedBusId || null,
        assignedRouteId: parsed.assignedRouteId || "r1",
        driverName: parsed.driverName || "",
        driverEmail: parsed.driverEmail || "",
        watchId: null,
        heartbeatInterval: null,
        lastWrittenPos: null
      };
    }
  } catch (e) {
    console.error("Failed to load tracking session from localStorage", e);
  }
  return {
    isTracking: false,
    assignedBusId: null,
    assignedRouteId: "r1",
    driverName: "",
    driverEmail: "",
    watchId: null,
    heartbeatInterval: null,
    lastWrittenPos: null
  };
};

// Global in-memory instance
let session: TrackingSession = loadSessionFromStorage();

// Haversine distance
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

// Callbacks to notify active listeners (e.g. DriverDashboard component)
const listeners = new Set<(session: TrackingSession) => void>();

export const trackingService = {
  getSession() {
    return { ...session };
  },

  subscribe(listener: (session: TrackingSession) => void) {
    listeners.add(listener);
    // Emit initial state immediately
    listener({ ...session });
    return () => {
      listeners.delete(listener);
    };
  },

  notify() {
    const current = { ...session };
    listeners.forEach((l) => l(current));
  },

  resume(onGpsError?: (err: GeolocationPositionError) => void) {
    if (!session.isTracking || (session.watchId !== null && session.heartbeatInterval !== null)) {
      return;
    }
    const savedBusId = session.assignedBusId;
    const savedRouteId = session.assignedRouteId;
    const savedDriverName = session.driverName;
    const savedDriverEmail = session.driverEmail;

    // Temporarily flip isTracking false to bypass start check
    session.isTracking = false;
    this.start(savedBusId || "", savedRouteId, savedDriverName, savedDriverEmail, onGpsError);
  },

  start(busId: string, routeId: string, driverName: string, driverEmail: string, onGpsError?: (err: GeolocationPositionError) => void) {
    if (session.isTracking) return;

    const cleanBusId = busId.toLowerCase();
    const busRef = ref(rtdb, `buses/${cleanBusId}`);
    const route = SARGODHA_ROUTES.find(r => r.id === routeId);

    session = {
      isTracking: true,
      assignedBusId: cleanBusId,
      assignedRouteId: routeId,
      driverName,
      driverEmail,
      watchId: null,
      heartbeatInterval: null,
      lastWrittenPos: null
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        isTracking: true,
        assignedBusId: cleanBusId,
        assignedRouteId: routeId,
        driverName,
        driverEmail
      }));
    } catch (e) {
      console.error("Failed to persist tracking session to storage:", e);
    }

    // Configure onDisconnect
    onDisconnect(busRef).update({
      status: "inactive",
      lat: GBS_TERMINAL.lat,
      lng: GBS_TERMINAL.lng,
      lastUpdated: Date.now()
    });

    // Pre-initialize static fields in RTDB
    set(busRef, {
      id: cleanBusId.toUpperCase(),
      routeId: routeId,
      routeName: route?.name || "",
      lat: GBS_TERMINAL.lat,
      lng: GBS_TERMINAL.lng,
      speed: 0,
      heading: 0,
      lastUpdated: Date.now(),
      status: "active",
      driverName: driverName,
      driverEmail: driverEmail
    });

    // Start 15s heartbeat
    session.heartbeatInterval = setInterval(() => {
      const currentPos = session.lastWrittenPos || GBS_TERMINAL;
      update(busRef, {
        id: cleanBusId.toUpperCase(),
        routeId: routeId,
        routeName: route?.name || "",
        driverName: driverName,
        driverEmail: driverEmail,
        lat: currentPos.lat,
        lng: currentPos.lng,
        lastUpdated: Date.now(),
        status: "active"
      });
    }, 15000);

    // Watch position
    session.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        
        if (session.lastWrittenPos) {
          const moved = calculateDistance(
            session.lastWrittenPos.lat, session.lastWrittenPos.lng,
            latitude, longitude
          );
          if (moved < 0.002) return; // 2 meters jitter threshold
        }

        session.lastWrittenPos = { lat: latitude, lng: longitude };

        update(busRef, {
          id: cleanBusId.toUpperCase(),
          routeId: routeId,
          routeName: route?.name || "",
          driverName: driverName,
          driverEmail: driverEmail,
          lat: latitude,
          lng: longitude,
          speed: speed ? Math.round(speed * 3.6) : 0,
          heading: heading || 0,
          lastUpdated: Date.now(),
          status: "active"
        });

        this.notify();
      },
      (error) => {
        console.warn("GPS Watch warning/error:", error);
        if (onGpsError) {
          onGpsError(error);
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    this.notify();
  },

  stop() {
    if (!session.isTracking) return;

    if (session.watchId !== null) {
      navigator.geolocation.clearWatch(session.watchId);
    }
    if (session.heartbeatInterval) {
      clearInterval(session.heartbeatInterval);
    }

    if (session.assignedBusId) {
      const busRef = ref(rtdb, `buses/${session.assignedBusId}`);
      update(busRef, { 
        status: "inactive",
        lat: GBS_TERMINAL.lat,
        lng: GBS_TERMINAL.lng,
        lastUpdated: Date.now()
      });
      onDisconnect(busRef).cancel();
    }

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove persisted session from storage:", e);
    }

    session = {
      isTracking: false,
      assignedBusId: null,
      assignedRouteId: "r1",
      driverName: "",
      driverEmail: "",
      watchId: null,
      heartbeatInterval: null,
      lastWrittenPos: null
    };

    this.notify();
  }
};
