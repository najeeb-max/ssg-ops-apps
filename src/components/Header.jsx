import { Link } from 'react-router-dom';
import { LogOut, Cloud } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const [dateTime, setDateTime] = useState('');
  const [weather, setWeather] = useState({ temp: '72°F', condition: 'Partly Cloudy' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      setDateTime(now.toLocaleDateString('en-US', options));
      setTick(prev => prev + 1);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b-2 border-red-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex-1 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{dateTime}</p>
              <div className="flex items-center gap-2 mt-1">
                <Cloud className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600">{weather.condition} • {weather.temp}</span>
              </div>
            </div>
          </div>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}