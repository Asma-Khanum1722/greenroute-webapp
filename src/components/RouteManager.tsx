import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, push, set, remove } from "firebase/database";
import { MapPin, Plus, Trash2, Save, Route as RouteIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SARGODHA_ROUTES } from "@/lib/routes";

const COMMON_DESTINATIONS = [
  { name: "University of Sargodha", lat: 32.0738, lng: 72.6835 },
  { name: "Shaheen Chowk", lat: 32.0912, lng: 72.6845 },
  { name: "Satellite Town", lat: 32.1023, lng: 72.6934 },
  { name: "DHQ Hospital", lat: 32.0745, lng: 72.6623 },
  { name: "47 Pull", lat: 32.0543, lng: 72.6845 },
  { name: "Kirana Hills", lat: 31.9745, lng: 72.7123 },
  { name: "PAF Colony", lat: 32.0512, lng: 72.6543 },
  { name: "Zafarullah Chowk", lat: 32.0812, lng: 72.6645 },
  { name: "Remount Depot", lat: 32.1123, lng: 72.6543 },
  { name: "Sillanwali Road", lat: 32.0645, lng: 72.6423 },
  { name: "Khayam Chowk", lat: 32.0712, lng: 72.6712 },
  { name: "Trust Plaza", lat: 32.0845, lng: 72.6711 },
];

export const RouteManager = () => {
  const [customRoutes, setCustomRoutes] = useState<any[]>([]);
  const [newRoute, setNewRoute] = useState({
    id: "",
    name: "",
    from: "GBS Sargodha",
    to: COMMON_DESTINATIONS[0].name,
    color: "#10b981",
  });

  useEffect(() => {
    const routesRef = ref(rtdb, "system/customRoutes");
    return onValue(routesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCustomRoutes(Object.entries(data).map(([dbId, val]: [string, any]) => ({
          dbId,
          ...val
        })));
      } else {
        setCustomRoutes([]);
      }
    });
  }, []);

  const handleAddRoute = async () => {
    if (!newRoute.id || !newRoute.name) {
      return toast.error("Please fill in route ID and name");
    }

    const destination = COMMON_DESTINATIONS.find(d => d.name === newRoute.to) || COMMON_DESTINATIONS[0];

    try {
      const routesRef = ref(rtdb, "system/customRoutes");
      await push(routesRef, {
        ...newRoute,
        id: newRoute.id.toLowerCase(),
        busCount: 0,
        distanceKm: 15,
        headway: 20,
        stops: [
          { id: `${newRoute.id}-origin`, name: newRoute.from, lat: 32.0835, lng: 72.6744 },
          { id: `${newRoute.id}-dest`, name: destination.name, lat: destination.lat, lng: destination.lng }
        ]
      });
      setNewRoute({ id: "", name: "", from: "GBS Sargodha", to: COMMON_DESTINATIONS[0].name, color: "#10b981" });
      toast.success("New route expansion saved to network database.");
    } catch (error) {
      toast.error("Failed to save route");
    }
  };

  const handleDeleteRoute = async (dbId: string) => {
    if (confirm("Decommission this custom route?")) {
      await remove(ref(rtdb, `system/customRoutes/${dbId}`));
      toast.info("Route removed from system.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Route Form */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Register New Route
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input 
            placeholder="Route ID (e.g. R9)" 
            value={newRoute.id}
            onChange={(e) => setNewRoute({...newRoute, id: e.target.value})}
            className="bg-white/5 border-white/10"
          />
          <Input 
            placeholder="Route Name" 
            value={newRoute.name}
            onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
            className="bg-white/5 border-white/10"
          />
          <div className="relative group">
            <select 
              value={newRoute.to}
              onChange={(e) => setNewRoute({...newRoute, to: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-10 text-[10px] font-bold text-white outline-none appearance-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer hover:bg-white/10"
            >
              {COMMON_DESTINATIONS.map(d => (
                <option key={d.name} value={d.name} className="bg-[#0A0F1A] text-white">
                  {d.name.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-3 h-3 rotate-90" />
            </div>
          </div>
          <Button 
            onClick={handleAddRoute} 
            className="w-full md:w-auto h-10 px-8 flex items-center justify-center gap-2 group transition-all"
          >
            <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>CREATE ROUTE</span>
          </Button>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Static Official Routes */}
        {SARGODHA_ROUTES.map((route) => (
          <div key={route.id} className="glass-card p-6 border-white/5 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded uppercase">Official</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
            </div>
            <h4 className="font-bold text-white mb-1">{route.name}</h4>
            <p className="text-xs text-muted-foreground">{route.from} → {route.to}</p>
          </div>
        ))}

        {/* Custom Admin Routes */}
        {customRoutes.map((route) => (
          <div key={route.dbId} className="glass-card p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold px-2 py-1 bg-primary/20 text-primary rounded uppercase">Active Expansion</span>
              <button onClick={() => handleDeleteRoute(route.dbId)} className="text-white/20 hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-bold text-white mb-1">{route.name}</h4>
            <p className="text-xs text-muted-foreground">{route.from} → {route.to}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
