import { motion } from "framer-motion";

const partners = [
  { name: "Govt of Punjab", short: "GoP" },
  { name: "Sargodha Transport Authority", short: "STA" },
  { name: "University of Sargodha", short: "UoS" },
  { name: "City District Government", short: "CDG" },
];

export const Partners = () => {
  return (
    <section className="py-20 border-y border-foreground/5">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm mb-10 uppercase tracking-wider"
        >
          Trusted by Government & Institutions
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, opacity: 1 }}
              className="group cursor-pointer"
            >
              <div className="glass-card px-8 py-4 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-foreground/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <span className="font-display font-bold text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      {partner.short}
                    </span>
                  </div>
                  <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                    {partner.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
