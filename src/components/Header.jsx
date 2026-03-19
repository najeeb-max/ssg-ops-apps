import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Header() {
  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-red-600">SSG</span>
            <span className="text-xs font-bold text-white tracking-widest">OPS APPS</span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-red-600/50"></div>
          <span className="hidden sm:block text-sm font-semibold text-gray-300 italic">Streamline • Simplify • Grow</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}