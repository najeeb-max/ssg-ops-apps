import { useState, useMemo } from 'react';
import SSGLogo from '../components/SSGLogo';
import Header from '../components/Header';
import AppCard from '../components/AppCard';
import QatarNewsTile from '../components/QatarNewsTile';
import { Search } from 'lucide-react';
import {
  Files,
  BookOpen,
  ShoppingCart,
  Ship
} from 'lucide-react';

const COMPANY_APPS = [
  {
    id: 9,
    name: 'TradeFlow',
    description: 'Manage orders, shipments, suppliers and customers for China hub and direct express logistics',
    icon: Ship,
    color: 'bg-indigo-600',
    link: '/tradeflow',
    category: 'Collaboration'
  },
  {
    id: 8,
    name: 'PCS',
    description: 'Overview of SSG procurement price comparisons for Existing System Orders',
    icon: ShoppingCart,
    color: 'bg-red-600',
    link: '/pcs',
    category: 'Collaboration',
    hideName: true,
    customImage: 'https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/32d269562_ChatGPTImageMar27202603_38_22AM.png'
  },
  {
    id: 2,
    name: 'Document Hub',
    description: 'Create, edit, and collaborate on documents with seamless Google Docs sync',
    icon: Files,
    color: 'bg-red-700',
    link: '/documents',
    category: 'Collaboration'
  },
  {
    id: 5,
    name: 'Training Portal',
    description: 'Access courses and track learning progress via Google Classroom',
    icon: BookOpen,
    color: 'bg-red-700',
    link: '/learning',
    category: 'Learning'
  },

];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    return COMPANY_APPS.filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const newsTileMatchesSearch =
    'qatar news'.includes(searchQuery.toLowerCase()) ||
    'headlines'.includes(searchQuery.toLowerCase()) ||
    searchQuery === '';

  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col">
      <Header />

      {/* Hero Banner */}
      <div className="pt-20 flex items-center justify-center" style={{ backgroundColor: '#333333', minHeight: '220px' }} >
        <SSGLogo className="w-full max-w-lg h-auto px-8" />
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-6 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all text-slate-900 placeholder-gray-500"
            />
          </div>


        </div>
      </div>

      {/* Apps Grid */}
      <section className="flex-1 px-6 pb-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <AppCard key={app.id} {...app} layoutStyle="largelogo" />
            ))}
            {newsTileMatchesSearch && (
              <QatarNewsTile />
            )}
          </div>

          {filteredApps.length === 0 && !newsTileMatchesSearch && (
            <div className="text-center py-12">
              <p className="text-gray-600">No applications found matching your search</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 text-xs">&copy; 2026 SSG OPS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}