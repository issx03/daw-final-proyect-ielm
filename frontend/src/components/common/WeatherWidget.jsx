import { useEffect, useState, useRef } from 'react';
import { 
  Sun, Moon, Cloud, CloudSun, CloudFog, CloudDrizzle, 
  CloudRain, CloudSnow, CloudLightning, Search, Loader2, 
  X, ChevronRight 
} from 'lucide-react';

const DEFAULT_LOCATION = {
  name: 'Madrid',
  lat: 40.4168,
  lon: -3.7038,
  country: 'Spain',
};

const getWeatherDetails = (code, isDay) => {
  if (code === 0 || code === 1) {
    return { label: code === 0 ? 'Clear Sky' : 'Mainly Clear', icon: isDay ? Sun : Moon, color: 'text-amber-400' };
  }
  if (code === 2) return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-blue-300' };
  if (code === 3) return { label: 'Overcast', icon: Cloud, color: 'text-slate-400' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: CloudFog, color: 'text-slate-400' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: CloudDrizzle, color: 'text-sky-400' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Rainy', icon: CloudRain, color: 'text-blue-500' };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { label: 'Snowy', icon: CloudSnow, color: 'text-sky-200' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: CloudLightning, color: 'text-violet-400' };
  
  return { label: 'Cloudy', icon: Cloud, color: 'text-slate-400' };
};

const WeatherWidget = () => {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('weather_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });
  
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const popoverRef = useRef(null);

  // Fetch weather data when location coordinates change
  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,is_day,weather_code&timezone=auto`
        );
        if (!response.ok) throw new Error('Weather fetch failed');
        const data = await response.json();
        if (!data.current) throw new Error('Invalid weather data');
        
        if (active) {
          setWeather({
            temperature: data.current.temperature_2m,
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day,
          });
        }
      } catch (err) {
        if (active) {
          setError('Clima no disponible');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchWeather();
    return () => {
      active = false;
    };
  }, [location.lat, location.lon]);

  // Click outside listener to close popover
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchError('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchError('');
    setLoading(true);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`
      );
      if (!geoRes.ok) throw new Error('Search failed');
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Ciudad "${searchQuery}" no encontrada`);
      }

      const result = geoData.results[0];
      const newLoc = {
        name: result.name,
        lat: result.latitude,
        lon: result.longitude,
        country: result.country || '',
      };

      localStorage.setItem('weather_location', JSON.stringify(newLoc));
      setLocation(newLoc);
      setSearchQuery('');
      setIsOpen(false);
    } catch (err) {
      setSearchError(err.message || 'Error al buscar ciudad');
    } finally {
      setLoading(false);
    }
  };

  const weatherDetails = weather ? getWeatherDetails(weather.weatherCode, weather.isDay) : null;
  const WeatherIcon = weatherDetails ? weatherDetails.icon : Cloud;

  return (
    <div className="relative px-3 py-1.5" ref={popoverRef}>
      {/* Sidebar Compact Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#2A2A3A]/40 hover:bg-[#2A2A3A] border border-rgba(198,197,212,0.15) text-left transition-all duration-300 group active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#1E1E28] flex items-center justify-center flex-shrink-0">
            {loading ? (
              <Loader2 size={16} className="text-[#7C6BEF] animate-spin" />
            ) : (
              <WeatherIcon size={18} className={weatherDetails ? weatherDetails.color : 'text-slate-400'} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-bold text-[#E8E8EF] truncate leading-tight">
              {location.name}
            </span>
            <span className="text-[10px] text-[#6B7280] truncate leading-none mt-0.5">
              {loading ? 'Cargando...' : weatherDetails?.label || 'Clima'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-[#E8E8EF]">
            {weather ? `${Math.round(weather.temperature)}°` : '--'}
          </span>
          <ChevronRight size={14} className="text-[#4B5563] group-hover:text-[#8B8B9A] transition-colors" />
        </div>
      </button>

      {/* Sleek Popover Panel */}
      {isOpen && (
        <div className="absolute left-[245px] bottom-0 w-72 bg-[#1A1A24]/95 backdrop-blur-xl border border-[#2A2A3A] rounded-2xl p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-left-4 duration-200 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#7C6BEF] uppercase tracking-[0.12em]">
                Local Weather
              </span>
              <h4 className="text-[14px] font-extrabold text-[#E8E8EF] tracking-tight">
                {location.name}
              </h4>
            </div>
            <button
              onClick={() => { setIsOpen(false); setSearchError(''); }}
              className="p-1 text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-lg transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative mb-2.5">
            <input
              type="text"
              placeholder="Buscar ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E28] border border-[#2A2A3A] focus:border-[#7C6BEF]/50 rounded-xl pl-8 pr-12 py-1.5 text-[11px] font-semibold text-[#E8E8EF] transition-all outline-none placeholder:text-[#4B5563]"
            />
            <Search size={12} className="absolute left-2.5 top-2.5 text-[#4B5563]" />
            
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 top-1 px-2 py-0.5 bg-[#7C6BEF] text-white text-[9px] font-bold rounded hover:bg-[#9B8AF7] transition-all"
            >
              Ir
            </button>
          </form>

          {/* Search/Location error */}
          {(error || searchError) && (
            <div className="mb-2.5 p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <p className="text-[9px] font-medium text-red-400">
                {searchError || error}
              </p>
            </div>
          )}

          {/* Weather Stats Area */}
          {weather ? (
            <div className="flex items-center justify-between bg-[#1E1E28]/50 rounded-xl p-2.5 border border-[#2A2A3A]/30">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-[#E8E8EF] tracking-tight">
                  {Math.round(weather.temperature)}°C
                </span>
                <span className="text-[10px] font-medium text-[#8B8B9A] mt-0.5">
                  {weatherDetails?.label}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#1E1E28] flex items-center justify-center border border-[#2A2A3A]/50">
                <WeatherIcon size={22} className={weatherDetails?.color} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 size={20} className="text-[#7C6BEF] animate-spin mb-1.5" />
              <p className="text-[10px] text-[#6B7280]">Cargando clima...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
