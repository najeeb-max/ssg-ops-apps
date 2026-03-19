import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppCard({ name, description, icon: Icon, color, link }) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link to={link}>
        <div className="h-full bg-white rounded-2xl p-8 border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer">
          <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-4`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{name}</h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">{description}</p>
          <div className="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <span className="text-sm font-medium">Launch App</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}