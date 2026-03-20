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
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <img
            src="https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/4bd734812_74038218-a49d-416f-a638-f696a9d9ea15.png"
            alt="SSG OPS APPS"
            className="h-12 w-auto"
          />
        </Link>

        <div className="flex-1 flex justify-center">
          <motion.div className="text-center">
            <motion.p
              className="text-sm font-semibold text-slate-900"
              key={tick}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {dateTime}
            </motion.p>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <Cloud className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">{weather.condition} • {weather.temp}</span>
            </div>
          </motion.div>
        </div>
        
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