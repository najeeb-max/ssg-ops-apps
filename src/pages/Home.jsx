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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Header />

      {/* Hero Section with Large Logo */}
      <section className="pt-28 px-6 pb-16 bg-gradient-to-b from-black via-black to-gray-950 min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center justify-center mb-12"
          >
            <img 
              src="https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/99d91e4be_74038218-a49d-416f-a638-f696a9d9ea15.png" 
              alt="SSG OPS APPS"
              className="h-56 w-auto mb-8 drop-shadow-2xl"
            />
            <p className="text-xl text-gray-400 font-light tracking-widest mb-8">
              Streamline • Simplify • Grow
            </p>
            <p className="text-gray-500 text-center max-w-2xl mb-12 text-lg">
              Your unified workspace for enterprise operations. Access all critical business tools and integrations seamlessly integrated with Google Workspace.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-5 py-4 bg-gray-900 border-2 border-red-600/50 rounded-xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/30 transition-all text-white placeholder-gray-600 text-lg"
            />
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex gap-2 justify-center flex-wrap mb-16"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === category
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-red-600/50 hover:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="px-6 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
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
              <p className="text-gray-500 text-lg">No applications found matching your search</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-red-600/10 to-black border-t border-red-600/30 py-16 px-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <img 
                src="https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/99d91e4be_74038218-a49d-416f-a638-f696a9d9ea15.png" 
                alt="SSG OPS APPS"
                className="h-24 mb-6"
              />
              <p className="text-gray-500 text-sm leading-relaxed">Enterprise operations platform designed for modern teams.</p>
            </div>
            <div>
              <h3 className="text-red-600 font-bold mb-4 uppercase tracking-widest text-sm">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition">Features</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Integrations</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-red-600 font-bold mb-4 uppercase tracking-widest text-sm">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Contact IT</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8">
            <p className="text-center text-gray-600 text-sm">&copy; 2026 SSG OPS. All rights reserved. | Streamline • Simplify • Grow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}