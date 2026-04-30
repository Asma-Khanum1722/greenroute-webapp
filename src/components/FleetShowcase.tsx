import { motion } from "framer-motion";
import { Bus, Wifi, Battery, Shield, Zap, ThermometerSnowflake, Users, Clock, CreditCard } from "lucide-react";

export const FleetShowcase = () => {
  const features = [
    { icon: <Zap className="w-5 h-5" />, label: "100% Electric", detail: "Yutong 12-Metre Model" },
    { icon: <Wifi className="w-5 h-5" />, label: "Free Wi-Fi", detail: "On-board High Speed" },
    { icon: <Battery className="w-5 h-5" />, label: "USB Charging", detail: "Every seat integrated" },
    { icon: <Shield className="w-5 h-5" />, label: "Smart Safety", detail: "AI CCTV & GPS" },
    { icon: <ThermometerSnowflake className="w-5 h-5" />, label: "Climate Control", detail: "Full AC Interior" },
    { icon: <Users className="w-5 h-5" />, label: "80 Passengers", detail: "30 Seated | 50 Standing" },
  ];

  const serviceInfo = [
    { 
      icon: <Clock className="w-6 h-6 text-primary" />, 
      title: "Operating Hours", 
      value: "6:00 AM — 12:00 AM", 
      desc: "7 Days a week operation across all 8 routes." 
    },
    { 
      icon: <CreditCard className="w-6 h-6 text-primary" />, 
      title: "Flat Fare Policy", 
      value: "Rs. 20", 
      desc: "For male passengers. Free for women, students, & seniors." 
    },
    { 
      icon: <Bus className="w-6 h-6 text-primary" />, 
      title: "Active Fleet", 
      value: "33 Buses", 
      desc: "Phase 1 launch serving 128 official stops." 
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left: Visual Content - Staggered Gallery */}
          <div className="lg:w-1/2 relative h-[500px]">
            {/* Primary Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="absolute top-0 left-0 w-4/5 z-20 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <img 
                src="/electric buses sargodha 2.jpg" 
                alt="Sargodha Electric Bus Front View" 
                className="w-full aspect-video object-cover"
              />
            </motion.div>

            {/* Secondary Image - Staggered */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: 50 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-0 right-0 w-3/4 z-30 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <img 
                src="/electric buses sargodha 1.jpg" 
                alt="Sargodha Electric Bus Side View" 
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Fleet Identity</p>
                <p className="font-display font-bold text-primary">YUTONG ELECTRIC</p>
              </div>
            </motion.div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[120px] rounded-full z-0" />
          </div>

          {/* Right: Text Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                Sustainable Transit <br />
                <span className="text-primary italic">Reimagined.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                GreenRoute represents the future of Sargodha's urban mobility. 
                Our zero-emission fleet combines luxury with efficiency, 
                designed under the Punjab Government directive to provide 
                world-class transit for every citizen.
              </p>

              <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-12">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Service Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {serviceInfo.map((info, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 group hover:border-primary/50 transition-colors"
            >
              <div className="mb-4">{info.icon}</div>
              <h3 className="text-xl font-display font-bold mb-1">{info.title}</h3>
              <p className="text-2xl font-display font-bold text-primary mb-3">{info.value}</p>
              <p className="text-sm text-muted-foreground">{info.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
