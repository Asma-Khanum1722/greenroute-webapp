import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LayoutGrid, Bus, Activity, Database, ShieldCheck, ChevronRight } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutGrid className="w-5 h-5" />, label: "Overview", path: "/admin/overview" },
    { icon: <Bus className="w-5 h-5" />, label: "Fleet Manager", path: "/admin/fleet" },
    { icon: <Activity className="w-5 h-5" />, label: "Live Telemetry", path: "/admin/telemetry" },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white flex overflow-hidden font-sans selection:bg-primary/30">
      {/* Premium Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#020617] hidden lg:flex flex-col h-screen sticky top-0 shrink-0 relative overflow-hidden">
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none opacity-[0.03]" />
        
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-sm font-display font-bold text-white tracking-tight">GreenRoute Admin</h2>
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
                      : "text-white/30 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <span className={`${isActive ? "text-primary" : "text-white/20 group-hover:text-white/60"} transition-colors`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  {isActive && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,1)]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 relative z-10">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-primary transition-all flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5">
            <Activity className="w-4 h-4" /> Exit Command Center
          </Link>
        </div>
      </aside>

      {/* Main Command Area */}
      <section className="flex-1 h-screen flex flex-col overflow-hidden bg-[#020617]">
        {/* Top Bar */}
        <header className="h-20 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl flex items-center justify-between px-12 shrink-0 relative z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">System Online</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
              Region: <span className="text-white/60">Sargodha Division</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
               <p className="text-xs font-bold text-white tracking-tight">Administrator</p>
               <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Super User</p>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-sm">
               A
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </section>
    </main>
  );
}
