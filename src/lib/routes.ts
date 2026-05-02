/**
 * GreenRoute — Official Sargodha Electric Bus Routes
 * 
 * Source: PTC Official Route Cards (Sept 2025), Punjab Govt Official Portal.
 * Compiled for: GreenRoute FYP — University of Sargodha
 */

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  from: string;
  to: string;
  busCount: number;
  color: string;
  stops: Stop[];
  distanceKm: number;
  headway: number;
}

export const ORIGIN: Stop = {
  id: "gbs",
  name: "GBS Sargodha",
  lat: 32.0835,
  lng: 72.6744,
  notes: "Origin Terminal"
};

// Helper to interpolate coordinates for stops between origin and destination
const generateStops = (origin: Stop, terminal: Stop, stopNames: string[], routeId: string): Stop[] => {
  return stopNames.map((name, index) => {
    const ratio = index / (stopNames.length - 1);
    return {
      id: `${routeId}-s${index + 1}`,
      name: name,
      lat: origin.lat + (terminal.lat - origin.lat) * ratio,
      lng: origin.lng + (terminal.lng - origin.lng) * ratio,
      notes: index === 0 ? "Origin" : index === stopNames.length - 1 ? "Terminus" : ""
    };
  });
};

export const SARGODHA_ROUTES: Route[] = [
  {
    id: "r1",
    name: "R1 — Bhera Express",
    from: "GBS Sargodha",
    to: "Bhera",
    busCount: 4,
    color: "#10b981",
    distanceKm: 54,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r1-t", name: "Bhera Terminus", lat: 32.4782, lng: 72.9106 }, [
      "GBS Sargodha", "Chungi No. 9", "Satellite Town Chowk", "Gul Wala", "Qurtaba Town", 
      "40 Lingo Wash", "Moazam Abad", "33 Bhag", "Ajnala", "Sultanpur", "Bocha Kalan", 
      "Wan Miana", "Khan Muhammad Wala", "Bhera Terminus"
    ], "r1")
  },
  {
    id: "r2",
    name: "R2 — Bhalwal Express",
    from: "GBS Sargodha",
    to: "Bhalwal",
    busCount: 4,
    color: "#3b82f6",
    distanceKm: 51,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r2-t", name: "Bhalwal Terminus", lat: 32.2647, lng: 72.9056 }, [
      "GBS Sargodha", "Chungi Street No. 9", "Satellite Town Chowk", "Gillwala", "Din Colony", 
      "Qurtaba Town", "40 Phatak", "33 Phatak", "Chak 33 NB", "Ajnala", "Chak 30 NB", 
      "Anjala Loak Stop", "Chak 27 NB", "Chak 26 NB", "Chak 23 NB", "Chak 22 NB", 
      "Chak 10 NB", "Muhammad Hospital Bhalwal", "Sulemanpura", "Gobandpura", "Lari Adda, Bhalwal"
    ], "r2")
  },
  {
    id: "r3",
    name: "R3 — Sillanwali Route",
    from: "GBS Sargodha",
    to: "Sillanwali",
    busCount: 4,
    color: "#8b5cf6",
    distanceKm: 44,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r3-t", name: "Sillanwali Terminus", lat: 31.8242, lng: 72.5383 }, [
      "GBS Sargodha", "Green Town", "Quanchi Mor", "47 Pull", "Fatima Jinnah Hospital", 
      "University of Sargodha", "Khayam Chowk", "Noori Gate", "Red Crescent Hospital", 
      "Istiqlal-Abad Colony", "78 Pull", "Chak 79 NB", "85 Jhal", "91 NB Bus Stop", 
      "Chak 95 NB", "Chak No. 104", "Chak 106 NB", "Chak 108 NB", "Chak 107 NB", 
      "Chak 112 NB", "Chak No. 113 NB", "Chak No. 119", "Chak No. 125", "Chak 129 NB", "Kalma Chowk, Sillanwali"
    ], "r3")
  },
  {
    id: "r4",
    name: "R4 — Kot Momin Line",
    from: "GBS Sargodha",
    to: "Kot Momin",
    busCount: 4,
    color: "#f59e0b",
    distanceKm: 57,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r4-t", name: "Kot Momin Terminus", lat: 32.1901, lng: 72.8841 }, [
      "GBS Sargodha", "Chungi No. 9", "Aziz Colony", "Qartaba Town", "Jumeirah City", 
      "Chak 40 NB", "Rai Medical College", "Mitha Lak", "Chak No. 75 Alif SB", 
      "Mankumeel Stop", "Tango Wali", "Mozamabad", "Hospital 12 SB", "Laliani-Mateela Link", "Thaheemabad, Kot Momin"
    ], "r4")
  },
  {
    id: "r5",
    name: "R5 — Mid Ranjha Route",
    from: "GBS Sargodha",
    to: "Mid Ranjha",
    busCount: 5,
    color: "#ef4444",
    distanceKm: 55,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r5-t", name: "Mid Ranjha Terminus", lat: 32.3351, lng: 73.1205 }, [
      "GBS Sargodha", "Qanchi Mor", "Chak 91 Charging Hub", "Chak 81", "Bhagtnwala", "Dodha", "Sial Mor", "Mid Ranjha Terminus"
    ], "r5")
  },
  {
    id: "r6",
    name: "R6 — Shahpur City Line",
    from: "GBS Sargodha",
    to: "Shahpur City",
    busCount: 4,
    color: "#ec4899",
    distanceKm: 38,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r6-t", name: "Shahpur City Terminus", lat: 32.2925, lng: 72.4526 }, [
      "GBS Sargodha", "Chungi No. 9", "Satellite Town Chowk", "Trust Plaza", "DHQ Hospital", 
      "Noori Gate", "Aziz Bhatti Town", "Green Home", "Jhal Chakian", "Dhirama", "Chak 4", 
      "Vegowal", "Shahpur Sadar", "Shahpur City Terminus"
    ], "r6")
  },
  {
    id: "r7",
    name: "R7 — 46 Adda Route",
    from: "GBS Sargodha",
    to: "46 Adda",
    busCount: 4,
    color: "#06b6d4",
    distanceKm: 27,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r7-t", name: "46 Adda Terminus", lat: 32.1645, lng: 72.4821 }, [
      "GBS Sargodha", "Qanchi Mor", "47 Pull", "Ghani Park", "Chak 50", "49 Tail", "Sargodha Medical College", "Pull No. 111", "46 Adda Terminus"
    ], "r7")
  },
  {
    id: "r8",
    name: "R8 — Chhota Sahiwal",
    from: "GBS Sargodha",
    to: "Chhota Sahiwal",
    busCount: 4,
    color: "#f97316",
    distanceKm: 46,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r8-t", name: "GBS Sahiwal Terminus", lat: 31.9185, lng: 72.3312 }, [
      "GBS Sargodha", "Chungi No. 9", "Satellite Town", "Slampura", "DHQ Hospital", 
      "Noori Gate", "Red Crescent Hospital", "78 Pull", "85 Jhal", "Chak No. 84", 
      "Chak No. 92", "Ada Faiz Colony", "92 Mor", "Chak 93 NB", "Ahmed Pur Colony", 
      "Pumpan Wali Pull", "Colony Mirabad", "Chaway Wala", "Langar Wala", "Kud Lathi", 
      "Al Baqa Chowk", "GBS Sahiwal Terminus"
    ], "r8")
  }
];

export const FARE_POLICY = {
  generalMale: 20,
  women: 0,
  students: 0,
  seniors: 0,
  children: 0,
  pwd: 0,
};

export const SCHEDULE = {
  firstBus: "06:00 AM",
  lastBus: "12:00 AM",
  frequencyMinutes: 60,
  days: "Daily (7 days a week)",
};
