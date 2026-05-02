import { rtdb } from "./firebase";
import { ref, set } from "firebase/database";
import { SARGODHA_ROUTES } from "./routes";

/**
 * Seed 33 demo buses distributed across all 8 official Sargodha routes.
 */

const ROUTE_COUNTS = [4, 4, 4, 4, 5, 4, 4, 4]; // R5 has 5 buses

export const seedBuses = async () => {
  let busNumber = 1;

  for (let routeIdx = 0; routeIdx < SARGODHA_ROUTES.length; routeIdx++) {
    const route = SARGODHA_ROUTES[routeIdx];
    const count = ROUTE_COUNTS[routeIdx];
    const origin = route.stops[0];
    const destination = route.stops[route.stops.length - 1];

    for (let j = 0; j < count; j++) {
      // Place bus at a random point BETWEEN origin and destination for realism
      const progress = Math.random(); 
      const lat = origin.lat + (destination.lat - origin.lat) * progress;
      const lng = origin.lng + (destination.lng - origin.lng) * progress;

      const scatter = 0.003;
      const busRef = ref(rtdb, `buses/e${busNumber}`);
      await set(busRef, {
        id: `E${busNumber}`,
        routeId: route.id,
        routeName: route.name,
        lat: lat + (Math.random() - 0.5) * scatter,
        lng: lng + (Math.random() - 0.5) * scatter,
        speed: Math.floor(Math.random() * 50) + 15,
        heading: Math.floor(Math.random() * 360),
        status: Math.random() > 0.1 ? "active" : "inactive",
        capacity: 80,
        seatsAvailable: Math.floor(Math.random() * 60),
        fareRs: 20,
        lastUpdated: Date.now(),
      });

      busNumber++;
    }
  }

  console.log("✅ 33 buses seeded across 8 official Sargodha routes.");
};
