import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppCard({ name, description, icon: Icon, color, link }) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 40px 80px rgba(239, 68, 68, 0.25)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link to={link}>
        <div className="h-full bg-white border-2 border-gray-200 hover:border-red-600 rounded-2xl p-7 cursor-pointer group overflow-hidden relative shadow-sm hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-125 transition-transform`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">{name}</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{description}</p>
            <div className="flex items-center text-red-600 group-hover:text-red-700 font-bold transition-colors">
              <span className="text-sm">Launch App</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}