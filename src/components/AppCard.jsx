import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function CardContent({ name, description, icon: Icon, color, customImage, hideName, layoutStyle }) {
  if (layoutStyle === 'largelogo') {
    return (
      <div className="h-full bg-white border-2 border-gray-200 hover:border-red-600 rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
        {/* Banner area */}
        <div className={`${customImage ? 'bg-gray-50' : color} h-36 flex items-center justify-center relative`}>
          {customImage
            ? <img src={customImage} alt={name} className="h-28 w-28 object-contain" />
            : <Icon className="w-14 h-14 text-white" />}
        </div>
        {/* Content area */}
        <div className="p-5 relative">
          {!hideName && <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{name}</h3>}
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
          <div className="flex items-center text-red-600 group-hover:text-red-700 font-bold transition-colors">
            <span className="text-sm">Launch App</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="h-full bg-white border-2 border-gray-200 hover:border-red-600 rounded-2xl p-6 cursor-pointer group overflow-hidden relative shadow-sm hover:shadow-lg transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative">
        <div className={`${customImage ? 'bg-white rounded-xl overflow-hidden' : `w-14 h-14 ${color} rounded-xl`} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
          style={customImage ? { width: '150px', height: '150px', flexShrink: 0 } : {}}>
          {customImage ? <img src={customImage} alt={name} className="w-full h-full object-contain" /> : <Icon className="w-7 h-7 text-white" />}
        </div>
        {!hideName && <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">{name}</h3>}
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{description}</p>
        <div className="flex items-center text-red-600 group-hover:text-red-700 font-bold transition-colors">
          <span className="text-sm">Launch App</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </div>
  );
}

export default function AppCard({ name, description, icon, color, link, customImage, hideName, layoutStyle }) {
  const isExternal = link.startsWith('http');

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 40px 80px rgba(239, 68, 68, 0.25)' }}
      transition={{ duration: 0.3 }}
      className="h-full relative"
    >
      {isExternal ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block h-full">
          <CardContent name={name} description={description} icon={icon} color={color} customImage={customImage} hideName={hideName} layoutStyle={layoutStyle} />
        </a>
      ) : (
        <Link to={link} className="block h-full">
          <CardContent name={name} description={description} icon={icon} color={color} customImage={customImage} hideName={hideName} layoutStyle={layoutStyle} />
        </Link>
      )}
    </motion.div>
  );
}