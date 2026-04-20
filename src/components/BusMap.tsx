import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

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
}

interface BusMapProps {
  center?: [number, number];
  zoom?: number;
  showInactive?: boolean;
  className?: string;
}

const BusMap = ({ center = [32.15, 72.8], zoom = 10, showInactive = false }: BusMapProps) => {
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
        
        const filteredBuses = showInactive 
          ? busList 
          : busList.filter((bus: Bus) => bus.status === "active");

        setBuses(filteredBuses);
      }
    });

    return () => unsubscribe();
  }, [showInactive]);

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
        
        {/* Route Line */}
        <Polyline 
          positions={[[32.0734, 72.7000], [32.2647, 72.9056]]} 
          color="#10b981" 
          weight={4} 
          dashArray="10, 10"
        />

        {/* Stations */}
        <Marker position={[32.0734, 72.7000]} icon={stationIcon}>
          <Popup>Chak 91 Terminal (Main)</Popup>
        </Marker>
        <Marker position={[32.2647, 72.9056]} icon={stationIcon}>
          <Popup>Bhalwal Station</Popup>
        </Marker>

        {/* Live Buses */}
        {buses.map((bus) => (
          <Marker 
            key={bus.key} 
            position={[bus.lat, bus.lng]}
            icon={L.divIcon({
              className: "custom-div-icon",
              html: `<div style="
                background-color: ${bus.status === 'active' ? '#10b981' : '#6b7280'};
                padding: 8px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
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
              <div className="p-3">
                <h3 className="font-bold text-lg mb-1">{bus.id}</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${bus.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    Status: <span className="capitalize">{bus.status}</span>
                  </p>
                  {bus.driverName && (
                    <p className="text-primary font-medium italic">Driver: {bus.driverName}</p>
                  )}
                  <p>Speed: {bus.speed} km/h</p>
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
