import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function CardContent({ name, description, icon: Icon, color, customImage, hideName }) {
  return (
    <div className="h-full bg-white border-2 border-gray-200 hover:border-red-600 rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg transition-all">
      {/* Banner */}
      <div className={`${customImage ? 'bg-gray-50' : color} h-36 flex items-center justify-center`}>
        {customImage
          ? <img src={customImage} alt={name} loading="lazy" style={{width: 150, height: 150}} className="object-contain" />
          : <Icon className="w-12 h-12 text-white" />}
      </div>
      {/* Content */}
      <div className="p-3">
        {!hideName && <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-red-600 transition-colors">{name}</h3>}
        <p className="text-gray-500 text-xs leading-relaxed mb-2">{description}</p>
        <div className="flex items-center text-red-600 font-bold text-xs">
          Launch App
          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

export default function AppCard({ name, description, icon, color, link, customImage, hideName }) {
  const isExternal = link.startsWith('http');

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 30px 60px rgba(239,68,68,0.2)' }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      {isExternal ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block h-full">
          <CardContent name={name} description={description} icon={icon} color={color} customImage={customImage} hideName={hideName} />
        </a>
      ) : (
        <Link to={link} className="block h-full">
          <CardContent name={name} description={description} icon={icon} color={color} customImage={customImage} hideName={hideName} />
        </Link>
      )}
    </motion.div>
  );
}