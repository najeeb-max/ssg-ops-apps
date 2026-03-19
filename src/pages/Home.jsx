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
    id: 3,
    name: 'Email Manager',
    description: 'Centralized email management and communications powered by Gmail',
    icon: Mail,
    color: 'bg-red-600',
    link: '/email',
    category: 'Communication'
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
    color: 'bg-slate-700',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-white to-gray-50 border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/99d91e4be_74038218-a49d-416f-a638-f696a9d9ea15.png" 
              alt="SSG OPS APPS"
              className="h-32 mb-6"
            />
            <p className="text-lg text-gray-600 mb-4 font-semibold italic">
              Streamline • Simplify • Grow
            </p>
            <p className="text-gray-600 mb-8 max-w-2xl">
              Access all your internal tools and integrations in one seamless workspace
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-all ${
                  activeCategory === category
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredApps.map((app) => (
              <AppCard key={app.id} {...app} />
            ))}
          </motion.div>

          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No apps found matching your search</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-gray-400 py-12 px-6 mt-16 border-t-4 border-red-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <img 
                src="https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/99d91e4be_74038218-a49d-416f-a638-f696a9d9ea15.png" 
                alt="SSG OPS APPS"
                className="h-20 mb-4"
              />
              <p className="text-sm">Unified workspace for all your business tools and integrations.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Google Workspace</h3>
              <p className="text-sm">Seamlessly connected with Calendar, Drive, Gmail, Sheets & more for maximum productivity.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <p className="text-sm">Need help? Contact the IT department or use the in-app support chat.</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm">
            <p>&copy; 2026 SSG OPS. All rights reserved. | Streamline • Simplify • Grow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}