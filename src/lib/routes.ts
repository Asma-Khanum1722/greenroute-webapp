/**
 * GreenRoute — Official Sargodha Electric Bus Routes
 * 
 * Source: PTC Official Route Cards (Sept 2025), Punjab Govt Official Portal.
 * Compiled for: GreenRoute FYP — University of Sargodha
 */

import roadDistances from "./road_distances.json";
import precomputedRoutes from "./precomputed_routes.json";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  notes?: string;
  roadDistanceToNextKm?: number;
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
  path?: [number, number][];
}

export const ORIGIN: Stop = {
  id: "gbs",
  name: "GBS Sargodha",
  lat: 32.0755605,
  lng: 72.6976644,
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
    distanceKm: (precomputedRoutes as any).r1.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r1.stops,
    path: (precomputedRoutes as any).r1.path
  },
  {
    id: "r2",
    name: "R2 — Bhalwal Express",
    from: "GBS Sargodha",
    to: "Bhalwal",
    busCount: 4,
    color: "#E65100",
    distanceKm: (precomputedRoutes as any).r2.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r2.stops,
    path: (precomputedRoutes as any).r2.path
  },
  {
    id: "r3",
    name: "R3 — Sillanwali Route",
    from: "GBS Sargodha",
    to: "Sillanwali",
    busCount: 4,
    color: "#6A1B9A",
    distanceKm: (precomputedRoutes as any).r3.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r3.stops,
    path: (precomputedRoutes as any).r3.path
  },
  {
    id: "r4",
    name: "R4 — Kot Momin Line",
    from: "GBS Sargodha",
    to: "Kot Momin",
    busCount: 4,
    color: "#B71C1C",
    distanceKm: (precomputedRoutes as any).r4.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r4.stops,
    path: (precomputedRoutes as any).r4.path
  },
  {
    id: "r5",
    name: "R5 — Mid Ranjha Route",
    from: "GBS Sargodha",
    to: "Mid Ranjha",
    busCount: 5,
    color: "#F9A825",
    distanceKm: (precomputedRoutes as any).r5.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r5.stops,
    path: (precomputedRoutes as any).r5.path
  },
  {
    id: "r6",
    name: "R6 — Shahpur City Line",
    from: "GBS Sargodha",
    to: "Shahpur City",
    busCount: 4,
    color: "#00838F",
    distanceKm: (precomputedRoutes as any).r6.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r6.stops,
    path: (precomputedRoutes as any).r6.path
  },
  {
    id: "r7",
    name: "R7 — 46 Adda Route",
    from: "GBS Sargodha",
    to: "46 Adda",
    busCount: 4,
    color: "#4E342E",
    distanceKm: (precomputedRoutes as any).r7.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r7.stops,
    path: (precomputedRoutes as any).r7.path
  },
  {
    id: "r8",
    name: "R8 — Chhota Sahiwal",
    from: "GBS Sargodha",
    to: "Chhota Sahiwal",
    busCount: 4,
    color: "#2E7D32",
    distanceKm: (precomputedRoutes as any).r8.distanceKm,
    headway: 60,
    stops: (precomputedRoutes as any).r8.stops,
    path: (precomputedRoutes as any).r8.path
  }
];

// Haversine distance
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

// Route-specific average speeds in km/h for smoothed ETA
export const getRouteAverageSpeed = (routeId: string): number => {
  switch (routeId) {
    case "r1": return 45;
    case "r2": return 45;
    case "r3": return 40;
    case "r4": return 45;
    case "r5": return 45;
    case "r6": return 40;
    case "r7": return 35;
    case "r8": return 40;
    default: return 40;
  }
};

export const getTrafficMultiplier = (): number => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    if (hour >= 12 && hour <= 16) return 1.15; // Afternoon weekend shoppers
    if (hour >= 18 && hour <= 21) return 1.20; // Evening leisure traffic
    return 0.90; // Light off-peak weekend
  }

  // Weekdays (Monday - Friday)
  if (hour === 8 || (hour === 9 && now.getMinutes() < 30)) {
    return 1.40; // Morning Peak (Office/School rush hour)
  }
  if (hour === 13 || hour === 14) {
    return 1.30; // Mid-day peak (School release)
  }
  if (hour >= 17 && hour <= 19) {
    return 1.45; // Evening peak (Market/Office closing rush hour)
  }
  if (hour >= 22 || hour < 6) {
    return 0.85; // Night free-flow
  }
  return 1.15; // Regular daytime urban traffic
};


export interface RouteCalculations {
  distanceKm: number;
  etaMinutes: number;
  isForward: boolean;
  closestStopName: string;
}

export const getRouteDistanceAndETA = (
  bus: { lat: number; lng: number; speed: number; heading?: number; routeId?: string },
  targetStop: Stop,
  route: Route
): RouteCalculations => {
  const stops = route.stops;
  if (!stops || stops.length < 2) {
    const rawDist = calculateDistance(bus.lat, bus.lng, targetStop.lat, targetStop.lng);
    const avgSpeed = getRouteAverageSpeed(bus.routeId || "");
    const speed = bus.speed > 10 ? (bus.speed * 0.7 + avgSpeed * 0.3) : avgSpeed;
    const mins = Math.max(1, Math.round((rawDist / speed) * 60));
    return {
      distanceKm: rawDist,
      etaMinutes: mins,
      isForward: true,
      closestStopName: targetStop.name
    };
  }

  // 1. Find target stop index
  const targetIndex = stops.findIndex(s => s.id === targetStop.id || (s.lat === targetStop.lat && s.lng === targetStop.lng));
  const finalTargetIndex = targetIndex === -1 ? stops.length - 1 : targetIndex;

  // 2. Project bus onto route segments to find closest segment and projection point
  let minProjDist = Infinity;
  let bestSegIndex = 0;
  let bestProj = { lat: bus.lat, lng: bus.lng };

  for (let i = 0; i < stops.length - 1; i++) {
    const A = stops[i];
    const B = stops[i + 1];
    const dx = B.lng - A.lng;
    const dy = B.lat - A.lat;
    const lenSq = dx * dx + dy * dy;
    
    let t = 0;
    if (lenSq > 0) {
      t = ((bus.lng - A.lng) * dx + (bus.lat - A.lat) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }
    
    const projLat = A.lat + t * dy;
    const projLng = A.lng + t * dx;
    const dist = calculateDistance(bus.lat, bus.lng, projLat, projLng);
    
    if (dist < minProjDist) {
      minProjDist = dist;
      bestSegIndex = i;
      bestProj = { lat: projLat, lng: projLng };
    }
  }

  // Helper to sum standard distances between route stops
  const sumStopDistances = (fromIdx: number, toIdx: number): number => {
    let sum = 0;
    const startIdx = Math.min(fromIdx, toIdx);
    const endIdx = Math.max(fromIdx, toIdx);
    for (let k = startIdx; k < endIdx; k++) {
      const roadDist = stops[k].roadDistanceToNextKm;
      if (roadDist !== undefined && roadDist > 0) {
        sum += roadDist;
      } else {
        // Fallback straight-line distance corrected for curves (15% curve multiplier)
        sum += calculateDistance(stops[k].lat, stops[k].lng, stops[k + 1].lat, stops[k + 1].lng) * 1.15;
      }
    }
    return sum;
  };

  // 3. Determine direction (forward vs backward) using heading vector dot product
  let isForward = true;
  if (bus.heading !== undefined && bus.heading !== null && bus.heading !== 0) {
    const A = stops[bestSegIndex];
    const B = stops[bestSegIndex + 1];
    const dx = B.lng - A.lng;
    const dy = B.lat - A.lat;
    
    const headingRad = (bus.heading * Math.PI) / 180;
    const hx = Math.sin(headingRad);
    const hy = Math.cos(headingRad);
    
    const dot = hx * dx + hy * dy;
    isForward = dot >= 0;
  } else {
    // Fallback: if bus is past target stop on forward trip, assume it's backward/returning
    isForward = bestSegIndex <= finalTargetIndex;
  }

  // 4. Calculate exact route distance based on travel direction
  let routeDist = 0;

  // Direct distance from current bus coordinates to target stop
  const directDistToTarget = calculateDistance(bus.lat, bus.lng, targetStop.lat, targetStop.lng);
  
  // Safety check: if the bus is off-route (i.e. more than 1.5 km away from the nearest route segment),
  // fallback to direct distance with a winding factor. This handles testing/simulating from arbitrary locations.
  const isOffRoute = minProjDist > 1.5;

  // Use a 2.5 km threshold for the origin stop (to handle terminal-to-stop offset)
  // and 0.5 km threshold for intermediate stops.
  const isNearTarget = finalTargetIndex === 0 
    ? directDistToTarget < 2.5 
    : directDistToTarget < 0.5;

  if (isNearTarget) {
    routeDist = directDistToTarget;
  } else if (isOffRoute) {
    // Off-route fallback
    routeDist = directDistToTarget * 1.2;
  } else {
    // Calculate partial segment distance with winding factor correction
    const segmentRoadDist = stops[bestSegIndex].roadDistanceToNextKm;
    const segmentStraightDist = calculateDistance(stops[bestSegIndex].lat, stops[bestSegIndex].lng, stops[bestSegIndex + 1].lat, stops[bestSegIndex + 1].lng);
    
    // Winding factor: ratio of road distance to straight distance, clamped to reasonable bounds [1.0, 1.45]
    let windingFactor = 1.15; // default curve multiplier
    if (segmentRoadDist && segmentStraightDist > 0) {
      windingFactor = Math.max(1.0, Math.min(1.45, segmentRoadDist / segmentStraightDist));
    }

    if (isForward) {
      if (finalTargetIndex > bestSegIndex) {
        // Bus is before target stop
        const d1 = calculateDistance(bestProj.lat, bestProj.lng, stops[bestSegIndex + 1].lat, stops[bestSegIndex + 1].lng) * windingFactor;
        const d2 = sumStopDistances(bestSegIndex + 1, finalTargetIndex);
        routeDist = d1 + d2;
      } else {
        // Bus has passed the target stop, traveling forward. It must loop.
        const dToTerminus = (calculateDistance(bestProj.lat, bestProj.lng, stops[bestSegIndex + 1].lat, stops[bestSegIndex + 1].lng) * windingFactor) +
          sumStopDistances(bestSegIndex + 1, stops.length - 1);
        const dReturn = sumStopDistances(finalTargetIndex, stops.length - 1);
        routeDist = dToTerminus + dReturn;
      }
    } else {
      // Traveling backward (returning from terminus to origin)
      if (finalTargetIndex < bestSegIndex + 1) {
        // Target is closer to origin, and we are moving towards origin.
        const d1 = calculateDistance(bestProj.lat, bestProj.lng, stops[bestSegIndex].lat, stops[bestSegIndex].lng) * windingFactor;
        const d2 = sumStopDistances(finalTargetIndex, bestSegIndex);
        routeDist = d1 + d2;
      } else {
        // Bus is moving backward, but target is behind us towards terminus. It must loop.
        const dToOrigin = (calculateDistance(bestProj.lat, bestProj.lng, stops[bestSegIndex].lat, stops[bestSegIndex].lng) * windingFactor) +
          sumStopDistances(0, bestSegIndex);
        const dForward = sumStopDistances(0, finalTargetIndex);
        routeDist = dToOrigin + dForward;
      }
    }
  }

  // 5. Calculate smoothed ETA
  const avgSpeed = getRouteAverageSpeed(route.id);
  const busSpeed = bus.speed || 0;
  
  // Blend GPS speed with historical average speed
  let blendedSpeed = avgSpeed;
  if (busSpeed > 12) {
    // Moving fast: trust GPS speed (80%) more than historical (20%)
    blendedSpeed = (busSpeed * 0.8 + avgSpeed * 0.2);
  } else if (busSpeed > 3) {
    // Crawling (e.g. traffic/approaching stop): blend 40% GPS with 60% historical
    blendedSpeed = (busSpeed * 0.4 + avgSpeed * 0.6);
  } else {
    // Stopped/idle: assume typical stop duration, use 80% of average speed to account for acceleration/restart delay
    blendedSpeed = avgSpeed * 0.80;
  }

  // Caps to prevent unrealistic ETAs due to extreme speed outliers/jitter
  const finalSpeed = Math.max(12, Math.min(55, blendedSpeed));

  // Add intermediate stop dwell time (~30s per intermediate stop)
  const intermediateStopCount = isNearTarget 
    ? 0 
    : Math.max(0, Math.abs(finalTargetIndex - bestSegIndex) - 1);
  const dwellTimeMinutes = intermediateStopCount * 0.5;

  // Apply time-of-day traffic multiplier
  const trafficMultiplier = getTrafficMultiplier();
  const etaMins = Math.max(1, Math.round(((routeDist / finalSpeed) * 60 + dwellTimeMinutes) * trafficMultiplier));

  return {
    distanceKm: routeDist,
    etaMinutes: etaMins,
    isForward,
    closestStopName: stops[bestSegIndex].name
  };
};

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
