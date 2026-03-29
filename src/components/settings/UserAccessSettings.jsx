import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  ShieldCheck, Loader2, FileSpreadsheet, TrendingUp,
  Crown, Plus, X, UserCheck, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Module definitions ────────────────────────────────────────────────────
const MODULES = [
  {
    key: 'can_access_pcs',
    label: 'PCS',
    description: 'Price Comparison Sheets',
    icon: FileSpreadsheet,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  {
    key: 'can_access_tradeflow',
    label: 'TradeFlow',
    description: 'Orders & Shipments',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
];

// ─── Team Members (localStorage) ──────────────────────────────────────────
const STORAGE_KEY = 'ssg_team_members';
const DEFAULT_MEMBERS = ['Najeeb Siddiqui', 'Hilal Ayyaz', 'Jassim Karim', 'Padam Prasad Ghimire', 'Kiptta Christofar', 'Muhammad Umair'];

function getStoredMembers() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : DEFAULT_MEMBERS;
  } catch { return DEFAULT_MEMBERS; }
}
function saveMembers(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ name, isAdmin }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${isAdmin ? 'bg-amber-500' : 'bg-slate-600'}`}>
      {initials}
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  );
}

// ─── Module Badge ──────────────────────────────────────────────────────────
function ModuleBadge({ module }) {
  const Icon = module.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${module.bg} ${module.color} border ${module.border}`}>
      <Icon className="w-3 h-3" />
      {module.label}
    </div>
  );
}

// ─── Main Access Table ─────────────────────────────────────────────────────
function AccessTable({ allUsers, onToggle }) {
  const admins = allUsers.filter(u => u.role === 'admin');
  const regularUsers = allUsers.filter(u => u.role !== 'admin');

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Header row */}
      <div className="grid bg-slate-50 border-b border-slate-200 px-4 py-3" style={{ gridTemplateColumns: `1fr repeat(${MODULES.length}, 120px)` }}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">User</div>
        {MODULES.map(m => (
          <div key={m.key} className="text-center">
            <ModuleBadge module={m} />
          </div>
        ))}
      </div>

      {/* Admin rows */}
      {admins.map(u => (
        <div key={u.id} className="grid items-center px-4 py-3 border-b border-slate-100 bg-amber-50/40" style={{ gridTemplateColumns: `1fr repeat(${MODULES.length}, 120px)` }}>
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={u.full_name || u.email} isAdmin />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{u.full_name || '—'}</p>
              <p className="text-xs text-slate-400 truncate">{u.email}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              <Crown className="w-2.5 h-2.5" /> Admin
            </span>
          </div>
          {MODULES.map(m => (
            <div key={m.key} className="flex justify-center">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          ))}
        </div>
      ))}

      {/* Regular user rows */}
      {regularUsers.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-400">No regular users registered yet.</div>
      ) : (
        regularUsers.map((u, idx) => (
          <div
            key={u.id}
            className={`grid items-center px-4 py-3 ${idx < regularUsers.length - 1 ? 'border-b border-slate-100' : ''}`}
            style={{ gridTemplateColumns: `1fr repeat(${MODULES.length}, 120px)` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={u.full_name || u.email} isAdmin={false} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{u.full_name || '—'}</p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
            </div>
            {MODULES.map(m => (
              <div key={m.key} className="flex justify-center">
                <ToggleSwitch
                  checked={!!u[m.key]}
                  onChange={(val) => onToggle(u, m, val)}
                />
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Team Members Panel ────────────────────────────────────────────────────
function TeamMembersPanel() {
  const [members, setMembers] = useState(getStoredMembers);
  const [newName, setNewName] = useState('');

  function handleAdd() {
    const t = newName.trim();
    if (!t) return;
    if (members.includes(t)) { toast.error('Already exists'); return; }
    const updated = [...members, t];
    setMembers(updated); saveMembers(updated); setNewName('');
    toast.success(`${t} added`);
  }

  function handleRemove(name) {
    const updated = members.filter(m => m !== name);
    setMembers(updated); saveMembers(updated);
  }

  function handleReset() {
    setMembers(DEFAULT_MEMBERS); saveMembers(DEFAULT_MEMBERS);
    toast.success('Reset to defaults');
  }

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Team Members
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Names available in the Team Member dropdown when creating orders.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">Reset</Button>
      </div>

      <div className="flex gap-2">
        <Input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="Add member name..." className="h-9 text-sm" />
        <Button size="sm" onClick={handleAdd} className="gap-1 shrink-0"><Plus className="w-3.5 h-3.5" /> Add</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map(name => (
          <span key={name} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full">
            {name}
            <button onClick={() => handleRemove(name)} className="text-slate-400 hover:text-destructive transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function UserAccessSettings() {
  const queryClient = useQueryClient();

  const { data: rawUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.functions.invoke('getAllUsers', {}).then(r => r.data.users),
  });

  const allUsers = rawUsers.map(u => ({
    ...u,
    role: u._app_role || u.role || 'user',
  }));

  function handleToggle(user, module, value) {
    base44.functions.invoke('updateUserAccess', { targetUserId: user.id, moduleKey: module.key, value })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['all-users'] });
        toast.success(`${user.full_name || user.email} — ${module.label} access ${value ? 'granted' : 'revoked'}`);
      })
      .catch(err => toast.error('Failed: ' + (err.message || err)));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const adminCount = allUsers.filter(u => (u._app_role || u.role) === 'admin').length;
  const userCount = allUsers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Module Access Control
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Toggle module access for each user. Admins always have full access.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {userCount} user{userCount !== 1 ? 's' : ''} · {adminCount} admin{adminCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {MODULES.map(m => (
          <ModuleBadge key={m.key} module={m} />
        ))}
      </div>

      {/* Access Table */}
      <AccessTable allUsers={allUsers} onToggle={handleToggle} />

      {/* Team members */}
      <TeamMembersPanel />
    </div>
  );
}

export { getStoredMembers };