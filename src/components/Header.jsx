import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Header() {
  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <img 
            src="https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/99d91e4be_74038218-a49d-416f-a638-f696a9d9ea15.png" 
            alt="SSG OPS APPS Logo"
            className="h-16 w-auto"
          />
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