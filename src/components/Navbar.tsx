import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const navLinks = [
  { label: "Map", href: "/#live-map" },
  { label: "Routes", href: "/routes" },
  { label: "Schedules", href: "/routes#schedule" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

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
      <div className="container mx-auto px-6">
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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-white/50 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTAs - Aligned Right */}
          <div className="hidden md:flex items-center gap-6 z-10">
            <Link to="/login?portal=driver">
              <span className="text-xs font-medium text-white/40 hover:text-white transition-colors cursor-pointer">
                Driver
              </span>
            </Link>
            <Link to="/login?portal=passenger">
              <Button size="sm" className="bg-primary hover:bg-emerald-500 text-black font-bold px-5 rounded-full h-9">
                Passenger Portal
              </Button>
            </Link>
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
            <div className="container mx-auto px-6 py-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-white/60"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
