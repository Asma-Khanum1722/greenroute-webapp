import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LayoutGrid, Bus, Activity, Database, ShieldCheck, ChevronRight, Menu, MapPin, UserCheck } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const location = useLocation();
  const [adminName, setAdminName] = useState("Administrator");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminName(docSnap.data().name);
        }
      }
    };
    fetchAdminProfile();
  }, []);

  const menuItems = [
    { icon: <LayoutGrid className="w-5 h-5" />, label: "Overview", path: "/control/overview" },
    { icon: <MapPin className="w-5 h-5" />, label: "Route Manager", path: "/control/routes" },
    { icon: <Bus className="w-5 h-5" />, label: "Fleet Manager", path: "/control/fleet" },
    { icon: <UserCheck className="w-5 h-5" />, label: "Driver Manager", path: "/control/drivers" },
    { icon: <Activity className="w-5 h-5" />, label: "Live Telemetry", path: "/control/telemetry" },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white flex overflow-hidden font-sans selection:bg-primary/30">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Premium Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 border-r border-white/5 bg-[#020617] z-[101] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-screen shrink-0 overflow-hidden
      `}>
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none opacity-[0.03]" />
        
        <div className="p-8 relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-sm font-display font-bold text-white tracking-tight">GreenRoute Admin</h2>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-white/40">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? "bg-white/5 text-primary border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" 
                      : "text-white/40 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <span className={`${isActive ? "text-primary" : "text-white/30 group-hover:text-white/60"} transition-colors`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  {isActive && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,1)]" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-primary transition-all flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
              <Activity className="w-4 h-4" /> Exit Command Center
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Command Area */}
      <section className="flex-1 h-screen flex flex-col overflow-hidden bg-[#020617]">
        {/* Top Bar */}
        <header className="h-16 md:h-20 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-12 shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 active:scale-90 transition-all"
            >
              <Menu className="w-5 h-5 text-primary" />
            </button>

            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
               <p className="text-[10px] font-bold text-white tracking-tight">{adminName}</p>
               <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Administrator</p>
             </div>
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-xs">
               {adminName[0]}
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </section>
    </main>
  );
}

