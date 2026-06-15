import { motion } from "framer-motion";
import { Leaf, Twitter, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  navigation: [
    { name: "Home", href: "/" },
    { name: "Live Map", href: "/passenger" },
    { name: "Routes", href: "/routes" },
  ],
};

export const Footer = () => {
  return (
    <footer className="relative py-10 md:py-20 overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-display font-bold text-[20vw] text-foreground/[0.02] whitespace-nowrap select-none">
          GreenRoute
        </span>
      </div>

      <div className="container mx-auto px-10 md:px-16 lg:px-32 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <a href="#" className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-lg text-foreground">
                GreenRoute
              </span>
            </a>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              A prototype transit portal based on the E-buses project initiated by 
              Chief Minister Maryam Nawaz Sharif.
            </p>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">
              Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>



          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">
              Legal
            </h4>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              © 2026 GreenRoute.
              <br />
              <span className="text-muted-foreground/40 italic">
                A Final Year Project Proposal
              </span>
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 pt-6 border-t border-foreground/5 text-center"
        >
          <p className="text-muted-foreground/50 text-[10px]">
            Built with 💚 for the people of Sargodha
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
