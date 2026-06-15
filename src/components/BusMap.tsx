import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useRoutes, getRouteDistanceAndETA, calculateDistance, getRouteAverageSpeed } from "@/lib/routes";
import { Button } from "./ui/button";
import { Maximize } from "lucide-react";

import { useDemo } from "@/lib/DemoContext";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const stationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448611.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface Bus {
  id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: string;
  routeId?: string;
  key?: string;
  driverName?: string;
  lastUpdated?: number;
}

interface BusMapProps {
  center?: [number, number];
  zoom?: number;
  showInactive?: boolean;
  className?: string;
  selectedRoute?: string;
  targetStop?: any;  // The stop selected by user
  onSelectStop?: (stop: any) => void;
  onBusesUpdate?: (buses: Bus[], calcETA: (bus: Bus, target?: { lat: number, lng: number }) => string) => void;
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  const resetView = () => {
    map.setView(center, zoom, { animate: true });
  };
  
  return (
    <button
      onClick={resetView}
      className="absolute bottom-10 right-10 z-[1000] p-4 bg-background/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl hover:bg-primary/10 transition-all duration-300 group overflow-hidden"
      title="Reset Network View"
    >
      <Maximize className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
    </button>
  );
}

const isActuallyActive = (bus: any, isDemoMode = false) => {
  if (bus.status === "inactive") return false;
  if ((Date.now() - (bus.lastUpdated || 0)) > 60000) return false;
  if (!bus.lat || !bus.lng) return false;
  if (bus.lat < 23 || bus.lat > 37) return false;
  if (bus.lng < 60 || bus.lng > 77) return false;
  if (!isDemoMode && !bus.driverEmail) return false;
  return true;
};

const BusMap = ({ 
  center = [32.0755605, 72.6976644], 
  zoom = 11, 
  showInactive = false, 
  selectedRoute = "all",
  targetStop = null,
  onSelectStop,
  onBusesUpdate
}: BusMapProps) => {
  const routes = useRoutes();
  const { isDemoMode, buses: demoBuses } = useDemo();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [mapStyle] = useState<"voyager">("voyager");

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setBuses(demoBuses);
      return;
    }

    const busesRef = ref(rtdb, "buses");
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const busList = Object.entries(data).map(([key, value]: [string, any]) => ({
          ...value,
          key
        }));
        setBuses(busList);
      }
    });

    return () => unsubscribe();
  }, [showInactive, selectedRoute, isDemoMode, demoBuses]);

  const activeRoute = routes.find(r => r.id === selectedRoute);
  
  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      if (!bus.id || bus.id === "undefined" || !bus.lat || !bus.lng) return false;
      if (!showInactive && !isActuallyActive(bus, isDemoMode)) return false;
      if (selectedRoute === "all") return true;
      return bus.routeId === selectedRoute;
    });
  }, [buses, showInactive, selectedRoute, isDemoMode]);

  const getBusStatus = (bus: Bus) => {
    if (!isActuallyActive(bus, isDemoMode)) return "offline";
    if (bus.speed === 0) return "idle";
    return "active";
  };

  const calculateETA = (bus: Bus, target: { lat: number, lng: number; id?: string }) => {
    const route = routes.find(r => r.id === bus.routeId);
    if (route && route.stops && route.stops.length > 0) {
      // Find matching stop on route
      const stop = route.stops.find(s => s.id === target.id || (Math.abs(s.lat - target.lat) < 0.0001 && Math.abs(s.lng - target.lng) < 0.0001));
      if (stop) {
        const calcs = getRouteDistanceAndETA(bus, stop, route);
        return `${calcs.etaMinutes} mins`;
      }
    }

    // Fallback to straight-line distance and route-smoothed speed
    const rawDist = calculateDistance(bus.lat, bus.lng, target.lat, target.lng);
    const avgSpeed = getRouteAverageSpeed(bus.routeId || "");
    const speed = bus.speed > 10 ? (bus.speed * 0.7 + avgSpeed * 0.3) : avgSpeed;
    const mins = Math.max(1, Math.round((rawDist / speed) * 60));
    return `${mins} mins`;
  };

  // Find next arrival for a specific stop
  const getNextArrival = (stop: any) => {
    if (selectedRoute === "all") return null;
    const busesOnRoute = buses.filter(b => b.routeId === selectedRoute && getBusStatus(b) !== "offline");
    if (busesOnRoute.length === 0) return "No buses";
    
    const etas = busesOnRoute.map(b => {
      const etaStr = calculateETA(b, stop);
      return parseInt(etaStr);
    });
    return `${Math.min(...etas)} mins`;
  };

  useEffect(() => {
    if (onBusesUpdate) {
      onBusesUpdate(filteredBuses, (bus, customTarget) => {
        const fallbackStop = routes[0]?.stops?.[routes[0]?.stops?.length - 1] || { lat: 32.0755605, lng: 72.6976644, id: "gbs", name: "GBS Sargodha" };
        return calculateETA(bus, customTarget || targetStop || fallbackStop);
      });
    }
  }, [filteredBuses, selectedRoute, targetStop, routes, onBusesUpdate]);

  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <div 
      className="h-[300px] md:h-[500px] w-full rounded-2xl overflow-hidden border border-border shadow-xl relative z-10"
      onClick={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      {!isInteracting && (
        <div className="absolute inset-0 z-[1000] bg-transparent cursor-pointer flex items-center justify-center pointer-events-auto lg:hidden">
          <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest shadow-lg">
            Tap to interact with map
          </div>
        </div>
      )}
      
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        dragging={isInteracting || (typeof window !== 'undefined' && window.innerWidth > 768)}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        <MapController center={center} zoom={zoom} />

        {/* Permanent City Landmarks for Context */}
        {[
          { name: "GBS Sargodha", lat: 32.0755605, lng: 72.6976644 },
          { name: "University of Sargodha", lat: 32.0728424, lng: 72.684187 },
          { name: "DHQ Hospital", lat: 32.0817926, lng: 72.6629141 },
          { name: "Satellite Town Chowk", lat: 32.0849, lng: 72.6889 },
          { name: "47 Pull", lat: 32.0495, lng: 72.6534 },
          { name: "Trust Plaza", lat: 32.0754, lng: 72.6743 },
          { name: "PAF Colony", lat: 32.0512, lng: 72.6543 },
          { name: "Kirana Hills", lat: 32.0123, lng: 72.6234 }
        ].map((poi, idx) => (
          <Marker 
            key={`poi-${idx}`} 
            position={[poi.lat, poi.lng]} 
            interactive={false}
            icon={L.divIcon({
              className: 'landmark-label',
              html: `<div class="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                      <div class="w-1 h-1 bg-black rounded-full mb-1"></div>
                      <span class="text-[8px] font-black uppercase tracking-[0.1em] text-black whitespace-nowrap">${poi.name}</span>
                    </div>`,
              iconSize: [0, 0]
            })}
          />
        ))}
        
        {/* All Route Polylines */}
        {routes.map(route => (
          <Polyline 
            key={route.id}
            positions={route.path || (route.stops ? route.stops.map(s => [s.lat, s.lng] as [number, number]) : [])} 
            color={route.color} 
            weight={4} 
            opacity={selectedRoute === "all" || selectedRoute === route.id ? 0.8 : 0.1}
          />
        ))}



        {/* Route Stop Markers */}
        {selectedRoute === "all"
          ? routes.flatMap(route =>
              route.stops ? route.stops.map((stop) => {
                const isBoarding = targetStop?.id === stop.id;
                
                let iconHtml = `<div style="background-color: ${route.color}; width: 8px; height: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); opacity: 0.7;"></div>`;
                let iconSz: [number, number] = [8, 8];
                let iconAnch: [number, number] = [4, 4];
                
                if (isBoarding) {
                  iconHtml = `
                    <div class="relative flex items-center justify-center w-6 h-6">
                      <div class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-45"></div>
                      <div class="absolute inset-1 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg">
                        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                    </div>
                  `;
                  iconSz = [24, 24];
                  iconAnch = [12, 12];
                }

                return (
                  <Marker 
                    key={stop.id} 
                    position={[stop.lat, stop.lng]} 
                    icon={L.divIcon({
                      className: "stop-dot",
                      html: iconHtml,
                      iconSize: iconSz,
                      iconAnchor: iconAnch,
                    })}
                  >
                    <Popup>
                      <div className="p-3 text-center min-w-[180px]">
                        <div className="font-bold text-sm mb-1">{stop.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Transit Stop</div>
                        <div className="text-[9px] font-bold mb-3 px-2 py-1 rounded-full inline-block" style={{ backgroundColor: `${route.color}20`, color: route.color }}>
                          {route.name}
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          {isBoarding ? (
                            <Button 
                              size="sm"
                              variant="destructive"
                              className="w-full h-8 text-[9px] uppercase font-bold"
                              onClick={() => onSelectStop && onSelectStop(null)}
                            >
                              Remove Boarding Stop
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              className="w-full h-8 text-[9px] uppercase font-bold"
                              onClick={() => onSelectStop && onSelectStop(stop)}
                            >
                              Set As Boarding Stop
                            </Button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            : []
          )
          : (activeRoute && activeRoute.stops ? activeRoute.stops.map((stop) => {
              const isBoarding = targetStop?.id === stop.id;
              
              let iconHtml = `<div style="background-color: ${activeRoute.color}; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`;
              let iconSz: [number, number] = [12, 12];
              let iconAnch: [number, number] = [6, 6];
              
              if (isBoarding) {
                iconHtml = `
                  <div class="relative flex items-center justify-center w-6 h-6">
                    <div class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-45"></div>
                    <div class="absolute inset-1 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg">
                      <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                  </div>
                `;
                iconSz = [24, 24];
                iconAnch = [12, 12];
              }

              return (
                <Marker 
                  key={stop.id} 
                  position={[stop.lat, stop.lng]} 
                  icon={L.divIcon({
                    className: "stop-dot",
                    html: iconHtml,
                    iconSize: iconSz,
                    iconAnchor: iconAnch,
                  })}
                >
                  <Popup>
                    <div className="p-3 text-center min-w-[180px]">
                      <div className="font-bold text-sm mb-1">{stop.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Transit Stop</div>
                      
                      <div className="bg-primary/5 rounded-lg p-2 mb-3 border border-primary/10">
                        <div className="text-[9px] text-primary font-bold uppercase mb-0.5">Next Arrival</div>
                        <div className="text-lg font-display font-bold text-primary">{getNextArrival(stop)}</div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        {isBoarding ? (
                          <Button 
                            size="sm"
                            variant="destructive"
                            className="w-full h-8 text-[9px] uppercase font-bold"
                            onClick={() => onSelectStop && onSelectStop(null)}
                          >
                            Remove Boarding Stop
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            className="w-full h-8 text-[9px] uppercase font-bold"
                            onClick={() => onSelectStop && onSelectStop(stop)}
                          >
                            Set As Boarding Stop
                          </Button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          : [])}

        {/* Live Buses */}
        {filteredBuses.map((bus) => {
          const status = getBusStatus(bus);
          const route = routes.find(r => r.id === bus.routeId);
          const routeColor = route?.color || "#666";
          
          let markerColor = routeColor;
          let pulseClass = "";
          
          if (status === "offline") {
            markerColor = "#94a3b8"; // Grey
          } else if (status === "idle") {
            markerColor = "#f59e0b"; // Amber
            pulseClass = "animate-marker-pulse-idle";
          } else if (status === "active") {
            pulseClass = "animate-marker-pulse";
          }

          return (
            <Marker 
              key={bus.key} 
              position={[bus.lat, bus.lng]}
              icon={L.divIcon({
                className: "custom-bus-icon",
                html: `
                  <div class="relative flex flex-col items-center">
                    <div class="${pulseClass}" style="
                      background-color: ${markerColor};
                      --pulse-color: ${markerColor}bb;
                      padding: 6px;
                      border-radius: 8px;
                      border: 2px solid white;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    ">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10"/>
                        <circle cx="14" cy="17" r="3"/>
                        <circle cx="6" cy="17" r="3"/>
                      </svg>
                    </div>
                    <div style="
                      background: white;
                      color: black;
                      font-size: 9px;
                      font-weight: 800;
                      padding: 1px 4px;
                      border-radius: 4px;
                      margin-top: 2px;
                      border: 1px solid ${markerColor};
                      white-space: nowrap;
                    ">${bus.id}</div>
                  </div>
                `,
                iconSize: [40, 50],
                iconAnchor: [20, 25],
              })}
            >
              <Popup>
                <div className="p-3 w-56">
                  <div className="flex items-center justify-between mb-2 border-b pb-2">
                    <h3 className="font-bold text-lg">{bus.id}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      status === 'active' ? 'bg-green-100 text-green-700' : 
                      status === 'idle' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {status}
                    </span>
                  </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Route</span>
                        <span className="font-bold text-xs px-2 py-1 rounded" style={{ backgroundColor: `${routeColor}20`, color: routeColor }}>
                          {route?.name.split('—')[1] || "Unassigned"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Speed</span>
                          <span className="font-display font-bold text-primary">{bus.speed || 0} <span className="text-[9px] font-normal text-muted-foreground">km/h</span></span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Status</span>
                          <span className={`text-[10px] font-bold ${status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>{status.toUpperCase()}</span>
                        </div>
                      </div>

                      {route && (
                        <div className="pt-2 border-t border-border mt-2">
                          <div className="flex justify-between items-end">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Next Terminal</span>
                              <span className="text-xs font-bold text-foreground">{route.to}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">ETA</span>
                              <span className="text-sm font-bold text-primary">{calculateETA(bus, route.stops[route.stops.length - 1])}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-[9px] text-center text-muted-foreground pt-1 border-t border-border/50">
                        Signal: {Math.round((currentTime - (bus.lastUpdated || 0))/1000)}s ago
                      </div>
                    </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default BusMap;
