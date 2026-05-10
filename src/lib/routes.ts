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
  lat: 32.0732,
  lng: 72.6713,
  notes: "Origin Terminal"
};

const generateStops = (origin: Stop, terminal: Stop, stopNames: string[], routeId: string, waypoints: {lat: number, lng: number}[] = []): Stop[] => {
  const allPoints = [origin, ...waypoints, terminal];
  const finalStops: Stop[] = [];
  
  const stopsPerSegment = Math.ceil(stopNames.length / (allPoints.length - 1));
  
  for (let i = 0; i < allPoints.length - 1; i++) {
    const start = allPoints[i];
    const end = allPoints[i+1];
    const segmentStopCount = i === allPoints.length - 2 
      ? stopNames.length - finalStops.length 
      : stopsPerSegment;

    for (let j = 0; j < segmentStopCount; j++) {
      const ratio = j / segmentStopCount;
      const stopIndex = finalStops.length;
      if (stopIndex >= stopNames.length) break;
      
      finalStops.push({
        id: `${routeId}-s${stopIndex + 1}`,
        name: stopNames[stopIndex],
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio,
        notes: stopIndex === 0 ? "Origin" : stopIndex === stopNames.length - 1 ? "Terminus" : ""
      });
    }
  }
  return finalStops;
};

export const SARGODHA_ROUTES: Route[] = [
  {
    id: "r1",
    name: "R1 — Bhera Express",
    from: "GBS Sargodha",
    to: "Bhera",
    busCount: 4,
    color: "#1565C0",
    distanceKm: 54,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r1-t", name: "Bhera Terminus", lat: 32.4782, lng: 72.9106 }, [
      "GBS Sargodha", "Chungi No. 9", "Satellite Town Chowk", "Gul Wala", "Qurtaba Town", 
      "40 Lingo Wash", "Moazam Abad", "33 Bhag", "Ajnala", "Sultanpur", "Bocha Kalan", 
      "Wan Miana", "Khan Muhammad Wala", "Bhera Terminus"
    ], "r1", [{lat: 32.1054, lng: 72.6934}, {lat: 32.2212, lng: 72.7845}])
  },
  {
    id: "r2",
    name: "R2 — Bhalwal Express",
    from: "GBS Sargodha",
    to: "Bhalwal",
    busCount: 4,
    color: "#E65100",
    distanceKm: 51,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r2-t", name: "Bhalwal Terminus", lat: 32.2647, lng: 72.9056 }, [
      "GBS Sargodha", "Chungi Street No. 9", "Satellite Town Chowk", "Gillwala", "Din Colony", 
      "Qurtaba Town", "40 Phatak", "33 Phatak", "Chak 33 NB", "Ajnala", "Chak 30 NB", 
      "Anjala Loak Stop", "Chak 27 NB", "Chak 26 NB", "Chak 23 NB", "Chak 22 NB", 
      "Chak 10 NB", "Muhammad Hospital Bhalwal", "Sulemanpura", "Gobandpura", "Lari Adda, Bhalwal"
    ], "r2", [{lat: 32.1123, lng: 72.7012}, {lat: 32.1845, lng: 72.7934}])
  },
  {
    id: "r3",
    name: "R3 — Sillanwali Route",
    from: "GBS Sargodha",
    to: "Sillanwali",
    busCount: 4,
    color: "#6A1B9A",
    distanceKm: 44,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r3-t", name: "Sillanwali Terminus", lat: 31.8242, lng: 72.5383 }, [
      "GBS Sargodha", "Green Town", "Quanchi Mor", "47 Pull", "Fatima Jinnah Hospital", 
      "University of Sargodha", "Khayam Chowk", "Noori Gate", "Red Crescent Hospital", 
      "Istiqlal-Abad Colony", "78 Pull", "Chak 79 NB", "85 Jhal", "91 NB Bus Stop", 
      "Chak 95 NB", "Chak No. 104", "Chak 106 NB", "Chak 108 NB", "Chak 107 NB", 
      "Chak 112 NB", "Chak No. 113 NB", "Chak No. 119", "Chak No. 125", "Chak 129 NB", "Kalma Chowk, Sillanwali"
    ], "r3", [{lat: 32.0712, lng: 72.6612}, {lat: 31.9545, lng: 72.5834}])
  },
  {
    id: "r4",
    name: "R4 — Kot Momin Line",
    from: "GBS Sargodha",
    to: "Kot Momin",
    busCount: 4,
    color: "#B71C1C",
    distanceKm: 57,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r4-t", name: "Kot Momin Terminus", lat: 32.1901, lng: 72.8841 }, [
      "GBS Sargodha", "Chungi No. 9", "Aziz Colony", "Qartaba Town", "Jumeirah City", 
      "Chak 40 NB", "Rai Medical College", "Mitha Lak", "Chak No. 75 Alif SB", 
      "Mankumeel Stop", "Tango Wali", "Mozamabad", "Hospital 12 SB", "Laliani-Mateela Link", "Thaheemabad, Kot Momin"
    ], "r4", [{lat: 32.1234, lng: 72.7543}, {lat: 32.1567, lng: 72.8234}])
  },
  {
    id: "r5",
    name: "R5 — Mid Ranjha Route",
    from: "GBS Sargodha",
    to: "Mid Ranjha",
    busCount: 5,
    color: "#F9A825",
    distanceKm: 55,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r5-t", name: "Mid Ranjha Terminus", lat: 32.3351, lng: 73.1205 }, [
      "GBS Sargodha", "Qanchi Mor", "Chak 91", "Chak 81", "Bhagtnwala", "Dodha", "Sial Mor", "Mid Ranjha Terminus"
    ], "r5", [{lat: 32.1543, lng: 72.8543}, {lat: 32.2567, lng: 72.9843}])
  },
  {
    id: "r6",
    name: "R6 — Shahpur City Line",
    from: "GBS Sargodha",
    to: "Shahpur City",
    busCount: 4,
    color: "#00838F",
    distanceKm: 38,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r6-t", name: "Shahpur City Terminus", lat: 32.2925, lng: 72.4526 }, [
      "GBS Sargodha", "Chungi No. 9", "Satellite Town Chowk", "Trust Plaza", "DHQ Hospital", 
      "Noori Gate", "Aziz Bhatti Town", "Green Home", "Jhal Chakian", "Dhirama", "Chak 4", 
      "Vegowal", "Shahpur Sadar", "Shahpur City Terminus"
    ], "r6", [{lat: 32.1234, lng: 72.6043}, {lat: 32.2045, lng: 72.5234}])
  },
  {
    id: "r7",
    name: "R7 — 46 Adda Route",
    from: "GBS Sargodha",
    to: "46 Adda",
    busCount: 4,
    color: "#4E342E",
    distanceKm: 27,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r7-t", name: "46 Adda Terminus", lat: 32.1645, lng: 72.4821 }, [
      "GBS Sargodha", "Qanchi Mor", "47 Pull", "Ghani Park", "Chak 50", "49 Tail", "Sargodha Medical College", "Pull No. 111", "46 Adda Terminus"
    ], "r7", [{lat: 32.1034, lng: 72.5843}, {lat: 32.1345, lng: 72.5343}])
  },
  {
    id: "r8",
    name: "R8 — Chhota Sahiwal",
    from: "GBS Sargodha",
    to: "Chhota Sahiwal",
    busCount: 4,
    color: "#2E7D32",
    distanceKm: 46,
    headway: 60,
    stops: generateStops(ORIGIN, { id: "r8-t", name: "GBS Sahiwal Terminus", lat: 31.9185, lng: 72.3312 }, [
      "GBS Sargodha", "Chungi No. 9", "Satellite Town", "Slampura", "DHQ Hospital", 
      "Noori Gate", "Red Crescent Hospital", "78 Pull", "85 Jhal", "Chak No. 84", 
      "Chak No. 92", "Ada Faiz Colony", "92 Mor", "Chak 93 NB", "Ahmed Pur Colony", 
      "Pumpan Wali Pull", "Colony Mirabad", "Chaway Wala", "Langar Wala", "Kud Lathi", 
      "Al Baqa Chowk", "GBS Sahiwal Terminus"
    ], "r8", [{lat: 32.0543, lng: 72.6043}, {lat: 31.9845, lng: 72.4543}])
  }
];

import { rtdb } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";

export const useRoutes = () => {
  const [allRoutes, setAllRoutes] = useState<Route[]>(SARGODHA_ROUTES);

  useEffect(() => {
    const customRoutesRef = ref(rtdb, "system/customRoutes");
    const unsubscribe = onValue(customRoutesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customList = Object.values(data) as Route[];
        setAllRoutes([...SARGODHA_ROUTES, ...customList]);
      } else {
        setAllRoutes(SARGODHA_ROUTES);
      }
    });
    return () => unsubscribe();
  }, []);

  return allRoutes;
};

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
