import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, remove, push, set } from "firebase/database";
import { Bus, Trash2, Plus, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { SARGODHA_ROUTES } from "@/lib/routes";

export const FleetManager = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [newBusId, setNewBusId] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(SARGODHA_ROUTES[0].id);

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
    <div className="glass-card p-6 border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            Fleet Inventory
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Manage physical bus units and route assignments.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Bus ID (E.g. E34)" 
            value={newBusId}
            onChange={(e) => setNewBusId(e.target.value)}
            className="w-32 bg-white/5 border-white/10 text-xs"
          />
          <select 
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:ring-1 ring-primary/50"
          >
            {SARGODHA_ROUTES.map(r => (
              <option key={r.id} value={r.id} className="bg-[#020617]">{r.name}</option>
            ))}
          </select>
          <Button onClick={handleAddBus} size="sm" className="bg-primary text-black font-bold h-9">
            <Plus className="w-4 h-4 mr-1" /> Add
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
