import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function QatarNewsTile() {
  const [headlines, setHeadlines] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.integrations.Core.InvokeLLM({
      prompt: `Give me 8 recent Qatar news headlines. Return JSON with an "articles" array, each item has: title (short, max 12 words), category (e.g. Politics, Business, Sports, Culture).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          articles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                category: { type: 'string' }
              }
            }
          }
        }
      }
    }).then(res => {
      setHeadlines(res.articles || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (headlines.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [headlines]);

  const categoryColors = {
    Politics: 'text-blue-500',
    Business: 'text-green-500',
    Sports: 'text-orange-500',
    Culture: 'text-purple-500',
    Technology: 'text-cyan-500',
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 40px 80px rgba(239, 68, 68, 0.25)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link to="/qatar-news">
        <div className="h-full bg-white border-2 border-gray-200 hover:border-red-600 rounded-2xl p-7 cursor-pointer group overflow-hidden relative shadow-sm hover:shadow-lg transition-all flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex flex-col flex-1">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center mb-4 group-hover:scale-125 transition-transform">
              <Newspaper className="w-7 h-7 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Qatar News</h3>

            {/* Live badge */}
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Live Feed</span>
            </div>

            {/* Fade Carousel */}
            <div className="flex-1 min-h-[60px] relative">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.5 }}
                  >
                    {headlines[current] && (
                      <>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${categoryColors[headlines[current].category] || 'text-gray-400'}`}>
                          {headlines[current].category}
                        </span>
                        <p className="text-slate-700 text-sm font-medium mt-1 leading-snug">
                          {headlines[current].title}
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Dots */}
            {!loading && headlines.length > 0 && (
              <div className="flex gap-1 mt-3 mb-4">
                {headlines.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-red-500' : 'w-1.5 bg-gray-200'}`}
                  />
                ))}
              </div>
            )}

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