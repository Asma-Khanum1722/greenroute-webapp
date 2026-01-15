import { useEffect, useState } from "react";
import { Cloud, Thermometer, Wind, RefreshCcw } from "lucide-react";
import { fetchSargodhaWeather } from "@/lib/api";
import { motion } from "framer-motion";

const WeatherWidget = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getWeatherData = async () => {
    setLoading(true);
    const data = await fetchSargodhaWeather();
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    getWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-40">
        <RefreshCcw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 border-primary/20 bg-primary/5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          Sargodha Live Weather
        </h3>
        <span className="text-xs text-muted-foreground bg-foreground/5 px-2 py-1 rounded-full">
          REST API Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Thermometer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{weather?.current_weather?.temperature}°C</p>
            <p className="text-xs text-muted-foreground text-nowrap">Current Temp</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Wind className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{weather?.current_weather?.windspeed} <small className="text-sm">km/h</small></p>
            <p className="text-xs text-muted-foreground text-nowrap">Wind Speed</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-foreground/5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
          Data Streamed via Open-Meteo REST API
        </p>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
