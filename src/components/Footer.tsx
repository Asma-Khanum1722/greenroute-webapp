import { motion } from "framer-motion";
import { Leaf, Twitter, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  navigation: ["Home", "Live Map", "Contact", "Privacy"],
  socials: [
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Facebook, href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="relative py-20 overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-display font-bold text-[20vw] text-foreground/[0.02] whitespace-nowrap select-none">
          GreenRoute
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <a href="#" className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl text-foreground">
                GreenRoute
              </span>
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Official Transit Partner of Sargodha City. Making public transport
              reliable, one bus at a time.
            </p>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-display font-semibold text-foreground mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-display font-semibold text-foreground mb-4">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {footerLinks.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-display font-semibold text-foreground mb-4">
              Legal
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              © 2025 GreenRoute.
              <br />
              <span className="text-muted-foreground/60 text-xs">
                Initiated by Maryam Nawaz Sharif Scheme
              </span>
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-foreground/5 text-center"
        >
          <p className="text-muted-foreground/50 text-sm">
            Built with 💚 for the people of Sargodha
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
