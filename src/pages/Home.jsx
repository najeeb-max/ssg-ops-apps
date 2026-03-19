import { useState, useMemo } from 'react';
import Header from '../components/Header';
import AppCard from '../components/AppCard';
import { Search } from 'lucide-react';
import {
  Calendar,
  Files,
  Mail,
  Sheet,
  BookOpen,
  Presentation,
  Users,
  BarChart3,
  CheckSquare,
  DollarSign,
  Zap,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    id: 4,
    name: 'Spreadsheets',
    description: 'Analyze data and create reports with integrated Google Sheets',
    icon: Sheet,
    color: 'bg-red-500',
    link: '/sheets',
    category: 'Analytics'
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
    icon: Presentation,
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
  {
    id: 8,
    name: 'Analytics Dashboard',
    description: 'Track key metrics and performance indicators across all apps',
    icon: BarChart3,
    color: 'bg-red-600',
    link: '/analytics',
    category: 'Analytics'
  },
  {
    id: 9,
    name: 'Task Manager',
    description: 'Organize tasks, track progress, and collaborate with your team',
    icon: CheckSquare,
    color: 'bg-red-700',
    link: '/tasks',
    category: 'Productivity'
  },
  {
    id: 10,
    name: 'Expense Tracking',
    description: 'Log, approve, and manage company expenses and reimbursements',
    icon: DollarSign,
    color: 'bg-red-600',
    link: '/expenses',
    category: 'Finance'
  },
  {
    id: 11,
    name: 'Automation Hub',
    description: 'Build and manage workflow automations across Google Workspace',
    icon: Zap,
    color: 'bg-red-700',
    link: '/automation',
    category: 'Productivity'
  },
  {
    id: 12,
    name: 'Settings & Admin',
    description: 'Manage app settings, permissions, and organizational preferences',
    icon: Settings,
    color: 'bg-red-600',
    link: '/admin',
    category: 'Administration'
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(COMPANY_APPS.map(app => app.category))];

  const filteredApps = useMemo(() => {
    return COMPANY_APPS.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 pt-24 px-6 pb-8">
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
            {categories.map((category) => (
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
            {filteredApps.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * idx }}
              >
                <AppCard {...app} />
              </motion.div>
            ))}
          </motion.div>

          {filteredApps.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No applications found matching your search</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-red-600 py-16 px-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <img 
                src="https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/99d91e4be_74038218-a49d-416f-a638-f696a9d9ea15.png" 
                alt="SSG OPS APPS"
                className="h-40 mb-6"
              />
              <p className="text-gray-700 text-sm leading-relaxed">Enterprise operations platform designed for modern teams.</p>
            </div>
            <div>
              <h3 className="text-red-600 font-bold mb-4 uppercase tracking-widest text-sm">Support</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-red-600 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Contact IT</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-8">
            <p className="text-center text-gray-700 text-sm">&copy; 2026 SSG OPS. All rights reserved. | Streamline • Simplify • Grow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}