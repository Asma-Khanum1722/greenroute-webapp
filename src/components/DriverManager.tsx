import { useState, useEffect } from "react";
import { db, firebaseConfig, rtdb } from "@/lib/firebase";
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { UserCheck, UserPlus, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useDemo } from "@/lib/DemoContext";

export const DriverManager = () => {
  const { isDemoMode } = useDemo();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeBuses, setActiveBuses] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "driver"));
    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const driverList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrivers(driverList);
    });

    const busesRef = ref(rtdb, "buses");
    const unsubscribeRTDB = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const busList = Object.values(data);
        setActiveBuses(busList);
      } else {
        setActiveBuses([]);
      }
    });

    return () => {
      unsubscribeFirestore();
      unsubscribeRTDB();
    };
  }, []);

  const isActuallyActive = (bus: any) => {
    if (bus.status === "inactive") return false;
    const lastTime = bus.lastUpdated || bus.lastUpdate || 0;
    if ((Date.now() - lastTime) > 60000) return false;
    if (!bus.lat || !bus.lng) return false;
    if (bus.lat < 23 || bus.lat > 37) return false;
    if (bus.lng < 60 || bus.lng > 77) return false;
    if (!isDemoMode && !bus.driverEmail) return false;
    return true;
  };

  const isDriverActive = (driverEmail: string, driverName: string) => {
    return activeBuses.some(
      (bus: any) => 
        ((bus.driverEmail && bus.driverEmail.toLowerCase() === driverEmail.toLowerCase()) ||
         (bus.driverName && bus.driverName.toLowerCase() === driverName.toLowerCase())) && 
        isActuallyActive(bus)
    );
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      return toast.error("Please fill in all fields (Name, Email, Password)");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setIsCreating(true);
    let secondaryApp;
    
    try {
      // 1. Initialize secondary app
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create the user on the secondary app instance
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;

      // 3. Create the user document in Firestore
      await setDoc(doc(db, "users", uid), {
        email: email,
        name: name,
        role: "driver",
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // 4. Sign out the secondary instance to be safe
      await signOut(secondaryAuth);

      toast.success(`Driver ${name} created successfully!`);
      setEmail("");
      setPassword("");
      setName("");
    } catch (error: any) {
      console.error("Error creating driver:", error);
      toast.error(error.message || "Failed to create driver account");
    } finally {
      // 5. Clean up the secondary app instance so it doesn't leak memory
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setIsCreating(false);
    }
  };

  const handleDeleteDriver = async (id: string, driverName: string, email: string) => {
    if (confirm(`Are you sure you want to remove access for driver: ${driverName}? This will delete their profile.`)) {
      try {
        // Query Firestore to find all user documents with this email and delete them
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        toast.success("Driver removed successfully");
      } catch (error) {
        toast.error("Failed to remove driver");
      }
    }
  };

  // Deduplicate drivers by email to ensure database duplicates don't clutter the UI
  const uniqueDrivers = drivers.filter(
    (driver, index, self) =>
      index === self.findIndex((d) => d.email?.toLowerCase() === driver.email?.toLowerCase())
  );

  // Sort drivers: Put active drivers on top, and sort alphabetically otherwise
  const sortedDrivers = [...uniqueDrivers].sort((a, b) => {
    const aActive = isDriverActive(a.email, a.name);
    const bActive = isDriverActive(b.email, b.name);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <div className="glass-card p-4 md:p-6 border-white/5 mt-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div>
          <h3 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Driver Management
          </h3>
          <p className="text-[10px] md:text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">Create and manage driver accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white/5 p-4 rounded-xl border border-white/5 h-fit">
          <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add New Driver
          </h4>
          <form onSubmit={handleCreateDriver} className="space-y-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 block">Full Name</label>
              <Input 
                placeholder="e.g. John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#0A0F1A] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 block">Email</label>
              <Input 
                type="email"
                placeholder="driver@greenroute.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0A0F1A] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 block">Password</label>
              <Input 
                type="text"
                placeholder="min 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0A0F1A] border-white/10 text-white"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="w-full bg-primary text-black font-bold h-10 rounded-xl mt-2 hover:bg-primary/90"
            >
              {isCreating ? "CREATING..." : "CREATE ACCOUNT"}
            </Button>
            <p className="text-[10px] text-primary/70 flex items-start gap-1 mt-2 leading-tight">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              Provide these credentials to the driver so they can log in to the Driver Dashboard.
            </p>
          </form>
        </div>

        {/* Drivers List */}
        <div className="lg:col-span-2 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedDrivers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-white/5 rounded-xl">
              No drivers registered in the system.
            </div>
          )}
          {sortedDrivers.map((driver) => (
            <div 
              key={driver.id} 
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-primary/10 border-primary/20">
                  <span className="text-primary font-bold text-sm">
                    {driver.name ? driver.name.charAt(0).toUpperCase() : "D"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{driver.name || "Unnamed Driver"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{driver.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block mr-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-0.5">Status</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isDriverActive(driver.email, driver.name) ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
                    <span className="text-[10px] font-bold text-white">{isDriverActive(driver.email, driver.name) ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteDriver(driver.id, driver.name, driver.email)}
                  className="text-white/20 hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
