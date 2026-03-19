import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Header() {
  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b-2 border-red-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <span className="text-sm font-bold text-red-600 tracking-widest">SSG OPS</span>
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