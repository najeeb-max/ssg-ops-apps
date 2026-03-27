import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function CardContent({ name, description, icon: Icon, color, customImage, hideName }) {
  return (
    <div className="h-full bg-white border-2 border-gray-200 hover:border-red-600 rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg transition-all">
      {/* Banner */}
      <div className={`${customImage ? 'bg-gray-50' : color} h-44 flex items-center justify-center`}>
        {customImage
          ? <img src={customImage} alt={name} style={{width: 200, height: 200}} className="object-contain" />
          : <Icon className="w-16 h-16 text-white" />}
      </div>
      {/* Content */}
      <div className="p-5">
        {!hideName && <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{name}</h3>}
        <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
        <div className="flex items-center text-red-600 font-bold text-sm">
          Launch App
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
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