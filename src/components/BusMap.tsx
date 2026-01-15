import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface BusMapProps {
  center?: [number, number];
  zoom?: number;
}

const BusMap = ({ center = [32.15, 72.8], zoom = 10 }: BusMapProps) => {
  const [busPos, setBusPos] = useState<[number, number]>([32.0734, 72.7000]);
  
  // Simulation logic for moving the bus
  useEffect(() => {
    const start: [number, number] = [32.0734, 72.7000]; // Chak 91
    const end: [number, number] = [32.2647, 72.9056];   // Bhalwal
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.01;
      if (progress > 1) progress = 0;
      
      const newLat = start[0] + (end[0] - start[0]) * progress;
      const newLng = start[1] + (end[1] - start[1]) * progress;
      setBusPos([newLat, newLng]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

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

        {/* Moving Bus */}
        <Marker position={busPos} icon={busIcon}>
          <Popup>
            <div className="text-sm font-medium">
              <p className="text-primary">Electrical Bus E1</p>
              <p>Status: On Route</p>
              <p>Speed: 45 km/h</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default BusMap;
