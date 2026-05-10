import { useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { SARGODHA_ROUTES, ORIGIN } from "@/lib/routes";

export const DemoController = () => {
  useEffect(() => {
    // Listen to Demo Mode status in Firebase
    const demoRef = ref(rtdb, "system/demoMode");
    let interval: NodeJS.Timeout | null = null;

    const unsubscribe = onValue(demoRef, (snapshot) => {
      const isDemoMode = snapshot.val();

      if (isDemoMode) {
        console.log("🚀 Demo Mode Activated: Starting Client-Side Simulation...");
        
        // Initialize 33 buses locally
        const buses = Array.from({ length: 33 }, (_, i) => {
          const route = SARGODHA_ROUTES[i % SARGODHA_ROUTES.length];
          const path = [ORIGIN, ...(route.stops.slice(1, -1)), route.stops[route.stops.length-1]];
          
          return {
            id: `E-${i + 1}`,
            key: `e${i + 1}`,
            routeId: route.id,
            path: path,
            currentSegment: Math.floor(Math.random() * (path.length - 1)),
            progress: Math.random(),
            direction: Math.random() > 0.5 ? 1 : -1
          };
        });

        interval = setInterval(async () => {
          for (let bus of buses) {
            const start = bus.path[bus.currentSegment];
            const end = bus.path[bus.currentSegment + 1];
            
            // Movement math
            const dLat = end.lat - start.lat;
            const dLng = end.lng - start.lng;
            const mag = Math.sqrt(dLat * dLat + dLng * dLng);
            
            const step = (0.0005 / (mag || 1)) * bus.direction;
            bus.progress += step;

            if (bus.progress >= 1) {
              bus.progress = 0;
              bus.currentSegment++;
              if (bus.currentSegment >= bus.path.length - 1) {
                bus.direction = -1;
                bus.currentSegment = bus.path.length - 2;
                bus.progress = 1;
              }
            } else if (bus.progress <= 0) {
              bus.progress = 1;
              bus.currentSegment--;
              if (bus.currentSegment < 0) {
                bus.direction = 1;
                bus.currentSegment = 0;
                bus.progress = 0;
              }
            }

            const currentLat = start.lat + (end.lat - start.lat) * bus.progress;
            const currentLng = start.lng + (end.lng - start.lng) * bus.progress;

            // Update Firebase
            update(ref(rtdb, `buses/${bus.key}`), {
              id: bus.id,
              routeId: bus.routeId,
              lat: currentLat,
              lng: currentLng,
              speed: Math.floor(Math.random() * 10) + 35,
              lastUpdated: Date.now(),
              status: "active"
            });
          }
        }, 2000);
      } else {
        if (interval) clearInterval(interval);
      }
    });

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);

  return null; // This component has no UI, it's a logical controller
};
