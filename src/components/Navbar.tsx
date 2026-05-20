import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import { rtdb } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { trackingService } from "@/lib/trackingService";

const navLinks = [
  { label: "Map", href: "/#live-map" },
  { label: "About Us", href: "/#about" },
  { label: "Routes", href: "/routes" },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData?.role || "passenger");
          setProfileName(userData?.name || null);
        }
      } else {
        // Enforce background tracking termination if authenticated state is lost
        trackingService.stop();
        setRole(null);
        setProfileName(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    // Stop persistent tracking first
    trackingService.stop();

    try {
      if (role === "driver" && profileName) {
        // Query the database to find any bus driven by this driver and set it to inactive
        const busesRef = ref(rtdb, "buses");
        const snapshot = await get(busesRef);
        if (snapshot.exists()) {
          const busesData = snapshot.val();
          for (const [key, value] of Object.entries(busesData) as any) {
            if (
              (value.driverEmail && value.driverEmail.toLowerCase() === currentUser?.email?.toLowerCase()) ||
              (value.driverName && value.driverName.toLowerCase() === profileName.toLowerCase())
            ) {
              const busRef = ref(rtdb, `buses/${key}`);
              await update(busRef, {
                status: "inactive",
                lastUpdated: Date.now()
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Cleanup on logout failed:", err);
    }
    await auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/Hide Logic
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      // Transparency Logic
      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "py-3 backdrop-blur-xl bg-background/90 border-b border-white/5" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-10 md:px-16 lg:px-32">
        <div className="relative flex items-center justify-between">
          {/* Logo - Aligned Left */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-white">
              Green<span className="text-primary">Route</span>
            </span>
          </Link>

          {/* Centered Links - Mathematically Centered */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10">
            {navLinks.map((link) => {
              const isHash = link.href.startsWith("/#");
              const targetId = isHash ? link.href.split("#")[1] : null;

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => {
                    if (isHash && location.pathname === "/") {
                      e.preventDefault();
                      document.getElementById(targetId!)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-all duration-300"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTAs - Aligned Right */}
          <div className="hidden md:flex items-center gap-6 z-10">
            {currentUser ? (
              <>
                <Link to={role === "admin" ? "/control" : role === "driver" ? "/driver" : "/passenger"}>
                  <Button variant="outline" size="sm" className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest border-primary/20 hover:border-primary/50 text-primary">
                    My Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-primary transition-colors"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest">
                  Access Portal
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white z-10"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="container mx-auto px-10 py-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                {currentUser ? (
                  <>
                    <Link 
                      to={role === "admin" ? "/control" : role === "driver" ? "/driver" : "/passenger"}
                      onClick={() => setIsOpen(false)}
                    >
                      <Button className="w-full py-6 text-[10px] font-bold uppercase tracking-[0.2em]">
                        My Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-primary"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-11 text-[10px] font-bold uppercase tracking-[0.2em]">
                      Access Portal
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
