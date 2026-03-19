import { Link } from 'react-router-dom';
import { Grid3x3, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Header() {
  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Grid3x3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Company Apps</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}