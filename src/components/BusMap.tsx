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
  targetStop?: any;  // The stop selected by user
  onSelectStop?: (stop: any) => void;
  onBusesUpdate?: (buses: Bus[], calcETA: (bus: Bus) => string) => void;
}

const BusMap = ({ 
  center = [32.074, 72.686], 
  zoom = 13, 
  showInactive = false, 
  selectedRoute = "all",
  targetStop = null,
  onSelectStop,
  onBusesUpdate
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
    return bus.routeId === selectedRoute;
  });

  // ETA to the specific official stop or terminal
  const calculateETA = (bus: Bus) => {
    const speed = bus.speed > 0 ? bus.speed : 20;
    const R = 6371;
    let targetLat: number, targetLng: number;

    if (targetStop) {
      // Primary: ETA to the official stop the user selected
      targetLat = targetStop.lat;
      targetLng = targetStop.lng;
    } else {
      // Fallback: ETA to final terminal
      const route = activeRoute || SARGODHA_ROUTES.find(r => r.id === bus.routeId);
      if (!route) return "N/A";
      const lastStop = route.stops[route.stops.length - 1];
      targetLat = lastStop.lat;
      targetLng = lastStop.lng;
    }

    const dLat = (targetLat - bus.lat) * Math.PI / 180;
    const dLon = (targetLng - bus.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(bus.lat * Math.PI/180) * Math.cos(targetLat * Math.PI/180) * Math.sin(dLon/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return `~${Math.max(1, Math.round((distance / speed) * 60))} mins`;
  };

  // ETA to route terminal (for general info)
  const calculateETAToTerminal = (bus: Bus) => {
    const route = activeRoute || SARGODHA_ROUTES.find(r => r.id === bus.routeId);
    if (!route) return "N/A";
    const speed = bus.speed > 0 ? bus.speed : 20;
    const R = 6371;
    const lastStop = route.stops[route.stops.length - 1];
    const dLat = (lastStop.lat - bus.lat) * Math.PI / 180;
    const dLon = (lastStop.lng - bus.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(bus.lat * Math.PI/180) * Math.cos(lastStop.lat * Math.PI/180) * Math.sin(dLon/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return `~${Math.max(1, Math.round((distance / speed) * 60))} mins`;
  };

  // Notify parent of current buses + ETA function so sidebar can display live ETAs
  useEffect(() => {
    if (onBusesUpdate) onBusesUpdate(filteredBuses, calculateETA);
  }, [filteredBuses.length, selectedRoute]);

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden glass-card relative z-10 border border-primary/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
      <div className="absolute top-4 right-4 z-[1000] glass-card px-3 py-1 text-[10px] uppercase tracking-widest text-primary border-primary/20">
        Live Tile API Active
      </div>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full bg-[#1a1c1e]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="map-charcoal-gray"
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
                background-color: #059669;
                padding: 6px;
                border-radius: 8px;
                border: 1px solid #10b981;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
                transition: all 0.3s ease;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10"/>
                  <circle cx="14" cy="17" r="3"/>
                  <circle cx="6" cy="17" r="3"/>
                </svg>
              </div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })}
          >
            <Popup className="custom-popup">
              <div className="p-3 w-56">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{bus.id}</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">LIVE</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Route:</span>
                    <span className="text-white font-medium text-xs">
                      {(activeRoute || SARGODHA_ROUTES.find(r => r.id === bus.routeId))?.name.split('—')[1]?.trim() || bus.routeId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Speed:</span>
                    <span className="text-white font-medium">{bus.speed || 0} km/h</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    {/* Official ETA Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-primary/80 font-bold uppercase tracking-wider">
                        {targetStop ? "📍 ETA to Stop:" : "🏁 ETA to Terminal:"}
                      </span>
                      <span className="font-display font-bold text-primary text-base">
                        {calculateETA(bus)}
                      </span>
                    </div>
                    {targetStop && (
                      <div className="flex items-center justify-between opacity-60">
                        <span className="text-[10px] text-muted-foreground">Terminus:</span>
                        <span className="text-xs text-white">
                          {calculateETAToTerminal(bus)}
                        </span>
                      </div>
                    )}
                    {!targetStop && (
                      <p className="text-[9px] text-primary/40 text-center pt-1 italic">
                        Select an intermediate stop for specific arrival time
                      </p>
                    )}
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
