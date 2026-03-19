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
    color: 'bg-blue-500',
    link: '/calendar',
    category: 'Communication'
  },
  {
    id: 2,
    name: 'Document Hub',
    description: 'Create, edit, and collaborate on documents with seamless Google Docs sync',
    icon: Files,
    color: 'bg-orange-500',
    link: '/documents',
    category: 'Collaboration'
  },
  {
    id: 3,
    name: 'Email Manager',
    description: 'Centralized email management and communications powered by Gmail',
    icon: Mail,
    color: 'bg-red-500',
    link: '/email',
    category: 'Communication'
  },
  {
    id: 4,
    name: 'Spreadsheets',
    description: 'Analyze data and create reports with integrated Google Sheets',
    icon: Sheet,
    color: 'bg-green-500',
    link: '/sheets',
    category: 'Analytics'
  },
  {
    id: 5,
    name: 'Training Portal',
    description: 'Access courses and track learning progress via Google Classroom',
    icon: BookOpen,
    color: 'bg-purple-500',
    link: '/learning',
    category: 'Learning'
  },
  {
    id: 6,
    name: 'Presentations',
    description: 'Create and deliver presentations using Google Slides',
    icon: Presentation,
    color: 'bg-yellow-500',
    link: '/presentations',
    category: 'Collaboration'
  },
  {
    id: 7,
    name: 'Team Directory',
    description: 'View team members, contact information, and organizational structure',
    icon: Users,
    color: 'bg-indigo-500',
    link: '/directory',
    category: 'People'
  },
  {
    id: 8,
    name: 'Analytics Dashboard',
    description: 'Track key metrics and performance indicators across all apps',
    icon: BarChart3,
    color: 'bg-cyan-500',
    link: '/analytics',
    category: 'Analytics'
  },
  {
    id: 9,
    name: 'Task Manager',
    description: 'Organize tasks, track progress, and collaborate with your team',
    icon: CheckSquare,
    color: 'bg-emerald-500',
    link: '/tasks',
    category: 'Productivity'
  },
  {
    id: 10,
    name: 'Expense Tracking',
    description: 'Log, approve, and manage company expenses and reimbursements',
    icon: DollarSign,
    color: 'bg-teal-500',
    link: '/expenses',
    category: 'Finance'
  },
  {
    id: 11,
    name: 'Automation Hub',
    description: 'Build and manage workflow automations across Google Workspace',
    icon: Zap,
    color: 'bg-pink-500',
    link: '/automation',
    category: 'Productivity'
  },
  {
    id: 12,
    name: 'Settings & Admin',
    description: 'Manage app settings, permissions, and organizational preferences',
    icon: Settings,
    color: 'bg-slate-600',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      {/* Hero Section */}
      <section className="py-12 px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Company App Portal
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Access all your internal tools and integrations in one seamless workspace
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              <p className="text-slate-600 text-lg">No apps found matching your search</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Company Apps</h3>
              <p className="text-sm">Unified workspace for all your business tools and integrations.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Integration</h3>
              <p className="text-sm">Seamlessly connected with Google Workspace for maximum productivity.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <p className="text-sm">Need help? Contact the IT department or use the in-app support chat.</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm">
            <p>&copy; 2026 Your Company. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}