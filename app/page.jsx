"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, Moon,
  MapPin, Loader2, AlertCircle, Wind, Droplets, Thermometer, Search
} from "lucide-react";
import { getBackground } from "../utils/weatherBg";

export default function Home() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bgInfo, setBgInfo] = useState({
    bgClass: "bg-gradient-to-br from-blue-100 to-blue-300",
    effectClass: "",
    isDay: true
  });
  const inputRef = useRef(null);

  const updateBackgroundAndTheme = (data) => {
    if (!data) return;
    const info = getBackground(data);
    setBgInfo(info);
  };

  const fetchWeather = async (queryParam) => {
    setLoading(true);
    setError("");
    setWeatherData(null);

    try {
      const res = await fetch(`/api/weather?${queryParam}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Service unavailable");
      }

      setWeatherData(data);
      updateBackgroundAndTheme(data);
      if (data.name) {
        localStorage.setItem("lastCity", data.name);
      }
    } catch (err) {
      setError(err.message || "Service unavailable");
      // Reset background on error to default
      setBgInfo({ bgClass: "bg-gradient-to-br from-blue-100 to-blue-300", effectClass: "", isDay: true });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.blur();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    fetchWeather(`city=${encodeURIComponent(city.trim())}`);
  };

  const handleLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      setError("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeather(`lat=${lat}&lon=${lon}`);
        },
        () => {
          setLoading(false);
          setError("Location access denied or unavailable.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      setCity(lastCity);
      fetchWeather(`city=${encodeURIComponent(lastCity)}`);
    } else {
      handleLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWeatherIcon = (data) => {
    const main = data.weather[0].main;
    const isNight = !bgInfo.isDay;
    const iconClass = "w-32 h-32 drop-shadow-lg mb-4";

    switch (main) {
      case "Clear":
        return isNight ? <Moon className={`${iconClass} text-slate-200`} /> : <Sun className={`${iconClass} text-yellow-500`} />;
      case "Clouds":
        return <Cloud className={`${iconClass} text-slate-100/90`} />;
      case "Rain":
        return <CloudRain className={`${iconClass} text-blue-200`} />;
      case "Drizzle":
        return <CloudDrizzle className={`${iconClass} text-blue-100`} />;
      case "Thunderstorm":
        return <CloudLightning className={`${iconClass} text-yellow-400`} />;
      case "Snow":
        return <CloudSnow className={`${iconClass} text-white`} />;
      default:
        return isNight ? <Moon className={`${iconClass} text-slate-200`} /> : <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  const isDarkTheme = bgInfo.bgClass.includes("slate-900") || bgInfo.bgClass.includes("gray-800") || bgInfo.bgClass.includes("gray-900") || bgInfo.bgClass.includes("blue-800") || bgInfo.bgClass.includes("indigo-950") || !bgInfo.isDay;
  const textColor = isDarkTheme ? "text-white" : "text-gray-800";

  return (
    <main className={`flex min-h-screen relative items-center justify-center p-4 transition-all duration-1000 ${bgInfo.bgClass}`}>
      
      {/* Dynamic Background Effects Layer */}
      {bgInfo.effectClass && (
        <div className={`weather-overlay ${bgInfo.effectClass}`} />
      )}
      
      {/* Optional Overlay to increase contrast slightly globally */}
      <div className="absolute inset-0 bg-black/5 z-0 pointer-events-none transition-colors duration-1000" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md z-10 ${isDarkTheme ? 'bg-black/30' : 'bg-white/40'} backdrop-blur-xl border ${isDarkTheme ? 'border-white/20' : 'border-white/50'} rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] relative overflow-hidden`}
      >
        <h1 className={`text-2xl font-bold ${textColor} text-center mb-6 transition-colors duration-1000`}>
          Modern Weather
        </h1>

        <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className={`w-full ${isDarkTheme ? 'bg-white/10 text-white placeholder-white/50 border-white/20 focus:bg-white/20' : 'bg-white/60 text-gray-800 placeholder-gray-500 border-white/40 focus:bg-white/80'} border rounded-full pl-5 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-medium`}
            />
            {city && (
              <button 
                type="button" 
                onClick={() => {
                  setCity("");
                  inputRef.current?.focus();
                }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkTheme ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !city.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full px-5 py-3 transition-colors duration-200 shadow-md flex items-center justify-center"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleLocation}
            disabled={loading}
            className={`${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white/50 hover:bg-white/70 text-gray-700 border-white/40'} disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-12 h-12 flex min-w-[48px] items-center justify-center transition-colors duration-200 shadow-sm border`}
            title="Use current location"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </form>

        <div className="min-h-[320px] flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex flex-col items-center justify-center space-y-4 ${textColor} transition-colors duration-1000`}
              >
                <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
                <p className="font-medium animate-pulse">Fetching weather...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`${isDarkTheme ? 'bg-red-500/20 text-red-100 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200'} border rounded-2xl p-6 text-center w-full shadow-inner`}
              >
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-80" />
                <p className="font-medium">{error}</p>
              </motion.div>
            ) : weatherData ? (
              <motion.div 
                key="weather"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                className="flex flex-col items-center w-full"
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {getWeatherIcon(weatherData)}
                </motion.div>

                <motion.h2 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className={`text-7xl font-bold tracking-tighter ${textColor} drop-shadow-sm transition-colors duration-1000`}
                >
                  {Math.round(weatherData.main.temp)}°
                </motion.h2>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center mt-1"
                >
                  <p className={`text-xl font-medium ${textColor} capitalize transition-colors duration-1000`}>
                    {weatherData.weather[0].description}
                  </p>
                  <p className={`flex items-center gap-1 ${isDarkTheme ? 'text-white/70' : 'text-gray-600'} mt-1 font-medium transition-colors duration-1000`}>
                    <MapPin className="w-4 h-4" /> {weatherData.name}
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 grid grid-cols-3 gap-3 w-full"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`${isDarkTheme ? 'bg-white/10' : 'bg-white/40'} p-3 rounded-2xl text-center shadow-sm backdrop-blur-sm transition-colors duration-1000`}
                  >
                    <Thermometer className={`w-5 h-5 mx-auto mb-1 ${isDarkTheme ? 'text-white/60' : 'text-gray-500'} transition-colors duration-1000`} />
                    <p className={`text-xs ${isDarkTheme ? 'text-white/60' : 'text-gray-500'} font-medium transition-colors duration-1000`}>Feels Like</p>
                    <p className={`font-bold ${textColor} text-sm mt-0.5 transition-colors duration-1000`}>
                      {Math.round(weatherData.main.feels_like)}°
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`${isDarkTheme ? 'bg-white/10' : 'bg-white/40'} p-3 rounded-2xl text-center shadow-sm backdrop-blur-sm transition-colors duration-1000`}
                  >
                    <Droplets className={`w-5 h-5 mx-auto mb-1 ${isDarkTheme ? 'text-white/60' : 'text-gray-500'} transition-colors duration-1000`} />
                    <p className={`text-xs ${isDarkTheme ? 'text-white/60' : 'text-gray-500'} font-medium transition-colors duration-1000`}>Humidity</p>
                    <p className={`font-bold ${textColor} text-sm mt-0.5 transition-colors duration-1000`}>
                      {weatherData.main.humidity || "--"}%
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`${isDarkTheme ? 'bg-white/10' : 'bg-white/40'} p-3 rounded-2xl text-center shadow-sm backdrop-blur-sm transition-colors duration-1000`}
                  >
                    <Wind className={`w-5 h-5 mx-auto mb-1 ${isDarkTheme ? 'text-white/60' : 'text-gray-500'} transition-colors duration-1000`} />
                    <p className={`text-xs ${isDarkTheme ? 'text-white/60' : 'text-gray-500'} font-medium transition-colors duration-1000`}>Wind</p>
                    <p className={`font-bold ${textColor} text-sm mt-0.5 whitespace-nowrap transition-colors duration-1000`}>
                      {(weatherData.wind.speed * 3.6).toFixed(0)} km/h
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}