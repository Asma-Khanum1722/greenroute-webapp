import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { SARGODHA_ROUTES } from "@/lib/routes";

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
}

interface BusMapProps {
  center?: [number, number];
  zoom?: number;
  showInactive?: boolean;
  className?: string;
  selectedRoute?: string;
  onSelectStop?: (stop: any) => void;
}

const BusMap = ({ 
  center = [32.074, 72.686], 
  zoom = 13, 
  showInactive = false, 
  selectedRoute = "all",
  onSelectStop
}: BusMapProps) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  useEffect(() => {
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
  }, [showInactive, selectedRoute]);

  const activeRoute = SARGODHA_ROUTES.find(r => r.id === selectedRoute);
  
  const filteredBuses = buses.filter(bus => {
    if (selectedRoute === "all") return true;
    // For demo purposes, if routeId isn't set, we show it on Route 91
    return (bus.routeId || "91") === selectedRoute;
  });

  // Calculate ETA to the last stop of the route
  const calculateETA = (bus: Bus) => {
    if (!activeRoute || bus.speed <= 5) return "Calculating...";
    const lastStop = activeRoute.stops[activeRoute.stops.length - 1];
    
    // Simple Haversine (re-implemented here for standalone component)
    const R = 6371; 
    const dLat = (lastStop.lat - bus.lat) * Math.PI / 180;
    const dLon = (lastStop.lng - bus.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(bus.lat * Math.PI / 180) * Math.cos(lastStop.lat * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    const timeHours = distance / bus.speed;
    const timeMinutes = Math.round(timeHours * 60);
    return `${timeMinutes} mins`;
  };

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden glass-card relative z-10 border border-primary/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
      <div className="absolute top-4 right-4 z-[1000] glass-card px-3 py-1 text-[10px] uppercase tracking-widest text-primary border-primary/20">
        Live Tile API Active
      </div>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full grayscale-[0.5] invert-[0.9] hue-rotate-[180deg] brightness-[0.8] contrast-[1.2]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Active Route Polyline */}
        {activeRoute && (
          <Polyline 
            positions={activeRoute.stops.map(s => [s.lat, s.lng] as [number, number])} 
            color={activeRoute.color} 
            weight={6} 
            opacity={0.6}
            dashArray="12, 12"
          />
        )}

        {/* Stations / Stops */}
        {(activeRoute ? activeRoute.stops : SARGODHA_ROUTES[0].stops).map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stationIcon}>
            <Popup>
              <div className="p-2 space-y-2">
                <div className="font-bold border-b border-primary/20 pb-1">{stop.name}</div>
                <button 
                  className="w-full text-[10px] h-7 bg-primary text-black font-bold rounded hover:bg-primary/90 transition-colors"
                  onClick={() => onSelectStop && onSelectStop(stop)}
                >
                  SET AS MY STOP
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Buses */}
        {filteredBuses.map((bus) => (
          <Marker 
            key={bus.key} 
            position={[bus.lat, bus.lng]}
            icon={L.divIcon({
              className: "custom-div-icon",
              html: `<div style="
                background-color: ${activeRoute?.color || '#10b981'};
                padding: 8px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 15px ${activeRoute?.color || '#10b981'}80;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.5s ease;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10"/>
                  <circle cx="14" cy="17" r="3"/>
                  <circle cx="6" cy="17" r="3"/>
                </svg>
              </div>`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })}
          >
            <Popup className="custom-popup">
              <div className="p-3 w-48">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{bus.id}</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">LIVE</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Route:</span>
                    <span className="text-white font-medium">{activeRoute?.name.split(':')[0] || "Route 91"}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Next Stop:</span>
                    <span className="text-white font-medium">{activeRoute?.stops[activeRoute.stops.length-1].name || "Company Bagh"}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-primary font-bold">ETA:</span>
                    <span className="text-xl font-display font-bold text-primary">{calculateETA(bus)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusMap;
