import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppCard({ name, description, icon: Icon, color, link }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 25px 50px rgba(239, 68, 68, 0.15)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link to={link}>
        <div className="h-full bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-red-500 transition-all cursor-pointer group">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">{name}</h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">{description}</p>
          <div className="flex items-center text-red-600 group-hover:text-red-700 font-semibold transition-colors">
            <span className="text-sm">Launch</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}