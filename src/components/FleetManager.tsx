import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, remove, push, set } from "firebase/database";
import { Bus, Trash2, Plus, ArrowRight, UserCheck, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useRoutes } from "@/lib/routes";

export const FleetManager = () => {
  const routes = useRoutes();
  const [buses, setBuses] = useState<any[]>([]);
  const [newBusId, setNewBusId] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("r1");

  useEffect(() => {
    const busesRef = ref(rtdb, "buses");
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const busList = Object.entries(data).map(([id, val]: [string, any]) => ({
          dbId: id,
          ...val,
        }));
        setBuses(busList);
      } else {
        setBuses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddBus = async () => {
    if (!newBusId) return toast.error("Enter a Bus ID (e.g., E40)");
    
    try {
      const busesRef = ref(rtdb, "buses");
      const newBusRef = push(busesRef);
      await set(newBusRef, {
        id: newBusId,
        routeId: selectedRoute,
        status: "offline",
        lastUpdate: Date.now(),
        lat: 32.0836, // Default Sargodha Center
        lng: 72.6711,
      });
      setNewBusId("");
      toast.success(`Bus ${newBusId} added to the fleet inventory.`);
    } catch (error) {
      toast.error("Failed to add bus");
    }
  };

  const handleDeleteBus = async (dbId: string, id: string) => {
    if (confirm(`Are you sure you want to decommission Bus ${id}?`)) {
      await remove(ref(rtdb, `buses/${dbId}`));
      toast.info(`Bus ${id} removed from fleet.`);
    }
  };

  return (
    <div className="glass-card p-4 md:p-6 border-white/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            Inventory
          </h3>
          <p className="text-[10px] md:text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">Physical Fleet Management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input 
            placeholder="Bus ID (E.g. E34)" 
            value={newBusId}
            onChange={(e) => setNewBusId(e.target.value)}
            className="flex-1 sm:w-32 bg-white/5 border-white/10 text-[10px] font-bold uppercase tracking-widest h-10"
          />
          <div className="relative flex-1 group">
            <select 
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-10 text-[10px] font-bold text-white outline-none appearance-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer hover:bg-white/10"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id} className="bg-[#0A0F1A] text-white py-4">
                  {r.id.toUpperCase()} — {r.name.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-3 h-3 rotate-90" />
            </div>
          </div>
          <Button onClick={handleAddBus} className="bg-primary text-black font-bold h-10 px-6 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> ADD UNIT
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {buses.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-white/5 rounded-xl">
            No buses registered in the system.
          </div>
        )}
        {buses.map((bus) => (
          <div 
            key={bus.dbId} 
            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                bus.status === 'online' ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'
              }`}>
                <Bus className={`w-5 h-5 ${bus.status === 'online' ? 'text-primary' : 'text-white/20'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{bus.id}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${bus.status === 'online' ? 'bg-primary animate-pulse' : 'bg-white/20'}`} />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{bus.status}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-0.5">Assigned Route</p>
                <p className="text-xs font-medium text-white">{bus.routeId}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDeleteBus(bus.dbId, bus.id)}
                className="text-white/20 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
