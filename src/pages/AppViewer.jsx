import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SSGLogo from '../components/SSGLogo';

export default function AppViewer() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const url = params.get('url');
  const name = params.get('name');

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white border-b-2 border-red-600 shadow-sm z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="h-5 w-px bg-gray-300" />
        <span className="text-sm font-semibold text-slate-800">{name}</span>
      </div>

      {/* Iframe */}
      <iframe
        src={url}
        className="flex-1 w-full border-none"
        title={name}
        allow="fullscreen"
      />
    </div>
  );
}