import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

const MODULES = [
  { key: 'can_access_pcs', label: 'PCS Module', description: 'Price Comparison Sheets' },
  { key: 'can_access_tradeflow', label: 'TradeFlow Module', description: 'Orders & Shipments' },
];

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function UserAccessSettings() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const toggle = async (user, moduleKey) => {
    const newValue = !user[moduleKey];
    await base44.entities.User.update(user.id, { [moduleKey]: newValue });
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    const mod = MODULES.find(m => m.key === moduleKey);
    toast.success(`${user.full_name}: ${mod.label} ${newValue ? 'enabled' : 'disabled'}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  // Sort: admins first, then by name
  const sorted = [...users].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    return (a.full_name || '').localeCompare(b.full_name || '');
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Module Access Control
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Admins always have full access. Toggle modules on/off per user below.</p>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              {MODULES.map(m => (
                <th key={m.key} className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <p>{m.label}</p>
                  <p className="font-normal normal-case text-slate-400">{m.description}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(user => {
              const isAdmin = user.role === 'admin';
              const isMe = user.email === me?.email;
              return (
                <tr key={user.id} className={`transition-colors ${isMe ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {user.full_name || '—'}
                      {isMe && <span className="ml-1.5 text-xs text-blue-500 font-normal">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  {MODULES.map(m => (
                    <td key={m.key} className="px-4 py-3 text-center">
                      {isAdmin ? (
                        <span className="text-xs text-emerald-600 font-medium">Always ✓</span>
                      ) : (
                        <div className="flex justify-center">
                          <Toggle
                            enabled={!!user[m.key]}
                            onChange={() => toggle(user, m.key)}
                          />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={2 + MODULES.length} className="text-center py-10 text-slate-400 text-sm">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}