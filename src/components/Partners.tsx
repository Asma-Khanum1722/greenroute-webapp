import { motion } from "framer-motion";

const partners = [
  { name: "University of Sargodha", short: "UoS" },
];

export const Partners = () => {
  return (
    <section className="py-10 md:py-20 border-y border-foreground/5 bg-foreground/[0.01]">
      <div className="container mx-auto px-10 md:px-16 lg:px-32">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-[10px] md:text-sm mb-6 md:mb-10 uppercase tracking-[0.2em]"
        >
          Institutional Partners
        </motion.p>

        <div className="grid grid-cols-2 lg:flex lg:items-center lg:justify-center gap-3 md:gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card px-3 py-3 md:px-8 md:py-4 transition-all duration-300 border-primary/10 hover:border-primary/40 bg-primary/[0.03]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/20 flex items-center justify-center transition-colors shadow-lg shadow-primary/5">
                    <span className="font-display font-bold text-[10px] md:text-sm text-primary">
                      {partner.short}
                    </span>
                  </div>
                  <span className="font-bold text-foreground transition-colors text-[10px] md:text-sm truncate">
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
