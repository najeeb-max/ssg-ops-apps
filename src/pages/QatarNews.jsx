import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { base44 } from '@/api/base44Client';
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react';

export default function QatarNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Fetch the latest 9 news headlines from Qatar. Include news from today or very recently. Return a JSON with a "articles" array where each item has: title, summary (2 sentences), category (e.g. Politics, Business, Sports, Culture, Technology), and source (e.g. Qatar Tribune, The Peninsula, Al Jazeera).`,
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
                summary: { type: 'string' },
                category: { type: 'string' },
                source: { type: 'string' }
              }
            }
          }
        }
      }
    });
    setNews(result.articles || []);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const categoryColors = {
    Politics: 'bg-blue-100 text-blue-700',
    Business: 'bg-green-100 text-green-700',
    Sports: 'bg-orange-100 text-orange-700',
    Culture: 'bg-purple-100 text-purple-700',
    Technology: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 pt-24 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Qatar News</h1>
                <p className="text-gray-500 text-sm">Latest headlines from Qatar</p>
              </div>
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article, i) => (
                <div key={i} className="bg-white border-2 border-gray-100 hover:border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[article.category] || 'bg-gray-100 text-gray-600'}`}>
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.source}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 leading-snug">{article.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{article.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}