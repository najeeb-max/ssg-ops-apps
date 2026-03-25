import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { base44 } from '@/api/base44Client';
import { Upload, Mail, ArrowLeft, CheckCircle, XCircle, Loader2, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function BulkInvite() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-gray-500 mt-2">Only admins can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const parseEmails = (text) => {
    return text
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEmailInput(prev => prev ? prev + '\n' + ev.target.result : ev.target.result);
    };
    reader.readAsText(file);
  };

  const handleInvite = async () => {
    const emails = parseEmails(emailInput);
    if (emails.length === 0) return;

    setLoading(true);
    setDone(false);
    setResults([]);

    const resultList = [];
    for (const email of emails) {
      try {
        await base44.users.inviteUser(email, 'user');
        resultList.push({ email, status: 'success' });
      } catch (err) {
        resultList.push({ email, status: 'error', message: err.message });
      }
      setResults([...resultList]);
    }

    setLoading(false);
    setDone(true);
  };

  const emails = parseEmails(emailInput);
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 pt-24 px-6 pb-8">
        <div className="max-w-2xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bulk Invite Users</h1>
              <p className="text-gray-500 text-sm">Invite multiple staff members at once</p>
            </div>
          </div>

          {/* Input Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Paste emails or upload a CSV/TXT file
            </label>
            <p className="text-xs text-gray-400 mb-3">Separate by new line, comma, or semicolon</p>
            <textarea
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              rows={8}
              placeholder={"john@ssg.com\njane@ssg.com\nbob@ssg.com"}
              className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:border-red-500 resize-none font-mono"
            />

            {/* File upload */}
            <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-red-600 transition-colors w-fit">
              <Upload className="w-4 h-4" />
              Upload CSV / TXT file
              <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            </label>

            {emails.length > 0 && (
              <p className="mt-3 text-sm text-green-600 font-medium">
                {emails.length} valid email{emails.length !== 1 ? 's' : ''} detected
              </p>
            )}
          </div>

          {/* Invite Button */}
          <button
            onClick={handleInvite}
            disabled={loading || emails.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Sending invitations...</>
            ) : (
              <><Mail className="w-5 h-5" /> Send {emails.length > 0 ? emails.length : ''} Invitation{emails.length !== 1 ? 's' : ''}</>
            )}
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-6 border-2 border-gray-100 rounded-2xl overflow-hidden">
              {done && (
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Results</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-green-600 font-medium">✓ {successCount} sent</span>
                    {errorCount > 0 && <span className="text-red-500 font-medium">✗ {errorCount} failed</span>}
                  </div>
                </div>
              )}
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-slate-700 font-mono">{r.email}</span>
                    <div className="flex items-center gap-1">
                      {r.status === 'success' ? (
                        <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-green-600">Invited</span></>
                      ) : (
                        <><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-red-500">{r.message || 'Failed'}</span></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}