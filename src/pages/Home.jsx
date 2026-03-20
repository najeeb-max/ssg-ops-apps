import { useState, useMemo } from 'react';
import Header from '../components/Header';
import AppCard from '../components/AppCard';
import QatarNewsTile from '../components/QatarNewsTile';
import { Search } from 'lucide-react';
import {
  Calendar,
  Files,
  BookOpen,
  Monitor,
  Users
} from 'lucide-react';

const COMPANY_APPS = [
  {
    id: 1,
    name: 'Calendar & Events',
    description: 'Manage team schedules, meetings, and events with Google Calendar integration',
    icon: Calendar,
    color: 'bg-red-600',
    link: '/calendar',
    category: 'Communication'
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
  {
    id: 6,
    name: 'Presentations',
    description: 'Create and deliver presentations using Google Slides',
    icon: Monitor,
    color: 'bg-red-600',
    link: '/presentations',
    category: 'Collaboration'
  },
  {
    id: 7,
    name: 'Team Directory',
    description: 'View team members, contact information, and organizational structure',
    icon: Users,
    color: 'bg-red-800',
    link: '/directory',
    category: 'People'
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const allCategories = ['All', 'Communication', 'Collaboration', 'Learning', 'People', 'News'];

  const filteredApps = useMemo(() => {
    return COMPANY_APPS.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const showNewsTile = activeCategory === 'All' || activeCategory === 'News';
  const newsTileMatchesSearch =
    'qatar news'.includes(searchQuery.toLowerCase()) ||
    'headlines'.includes(searchQuery.toLowerCase()) ||
    searchQuery === '';

  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col">
      <Header />

      {/* Hero Banner */}
      <div className="pt-20 bg-gradient-to-br from-red-950 via-red-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: `url("https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/4bd734812_74038218-a49d-416f-a638-f696a9d9ea15.png")`, backgroundSize: '260px', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', mixBlendMode: 'screen', opacity: 0.75 }}
        />
        <div className="relative py-16" />
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

          {/* Category Filter */}
          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <section className="flex-1 px-6 pb-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <AppCard key={app.id} {...app} />
            ))}
            {showNewsTile && newsTileMatchesSearch && (
              <QatarNewsTile />
            )}
          </div>

          {filteredApps.length === 0 && !(showNewsTile && newsTileMatchesSearch) && (
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