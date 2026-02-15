import { rtdb } from "./firebase";
import { ref, set } from "firebase/database";

/**
 * Seed script to populate the database with 33 simulated buses 
 * for demonstration purposes.
 */
export const seedBuses = async () => {
  const sargodhaCenter = { lat: 32.074, lng: 72.686 };
  
  for (let i = 1; i <= 33; i++) {
    const busId = `E${i}`;
    // Randomize positions slightly around Sargodha
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    const busRef = ref(rtdb, `buses/e${i}`);
    await set(busRef, {
      id: `${busId}-91`,
      lat: sargodhaCenter.lat + latOffset,
      lng: sargodhaCenter.lng + lngOffset,
      speed: Math.floor(Math.random() * 40) + 10,
      heading: Math.floor(Math.random() * 360),
      status: Math.random() > 0.3 ? "active" : "inactive",
      lastUpdated: Date.now()
    });
  }
  console.log("33 Buses Seeded Successfully!");
};
