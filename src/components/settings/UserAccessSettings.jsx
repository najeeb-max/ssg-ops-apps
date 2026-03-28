import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  ShieldCheck, Loader2, Users, FileSpreadsheet, TrendingUp,
  ChevronDown, Plus, X, UserCheck, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Module definitions ────────────────────────────────────────────────────
var MODULES = [
  {
    key: 'can_access_pcs',
    label: 'PCS Module',
    description: 'Price Comparison Sheets — procurement quoting workflow',
    icon: FileSpreadsheet,
    accent: 'red',
  },
  {
    key: 'can_access_tradeflow',
    label: 'TradeFlow Module',
    description: 'Orders, Shipments, Customers & Suppliers management',
    icon: TrendingUp,
    accent: 'indigo',
  },
];

var ACCENT = {
  red:    { border: 'border-red-200',    bg: 'bg-red-50',    icon: 'text-red-600',    badge: 'bg-red-100 text-red-700' },
  indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
};

// ─── Team Members (localStorage) ──────────────────────────────────────────
var STORAGE_KEY = 'ssg_team_members';
var DEFAULT_MEMBERS = ['Najeeb Siddiqui', 'Hilal Ayyaz', 'Jassim Karim', 'Padam Prasad Ghimire', 'Kiptta Christofar', 'Muhammad Umair'];

function getStoredMembers() {
  try {
    var s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : DEFAULT_MEMBERS;
  } catch { return DEFAULT_MEMBERS; }
}
function saveMembers(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

// ─── Sub-components ────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }) {
  var initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  var sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sz} rounded-full bg-slate-700 text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

function UserPill({ user, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-1 pr-2 py-1 shadow-sm">
      <Avatar name={user.full_name || user.email} />
      <span className="text-xs font-medium text-slate-700 truncate max-w-[130px]">{user.full_name || user.email}</span>
      <button onClick={() => onRemove(user)} className="text-slate-300 hover:text-red-500 transition-colors ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function AddUserDropdown({ available, onAdd }) {
  var [open, setOpen] = useState(false);
  if (available.length === 0) return null;
  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-dashed"
        onClick={() => setOpen(o => !o)}>
        <Plus className="w-3.5 h-3.5" /> Add User <ChevronDown className="w-3 h-3 text-slate-400" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg w-60 py-1 overflow-hidden">
            {available.map(u => (
              <button key={u.id} onClick={() => { onAdd(u); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors">
                <Avatar name={u.full_name || u.email} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{u.full_name || '—'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ModuleCard({ module, allUsers, onGrant, onRevoke }) {
  var a = ACCENT[module.accent];
  var Icon = module.icon;
  var admins = allUsers.filter(u => u.role === 'admin');
  var regularUsers = allUsers.filter(u => u.role !== 'admin');
  var grantedUsers = regularUsers.filter(u => !!(u.data && u.data[module.key]));
  var grantedIds = new Set(grantedUsers.map(u => u.id));
  var available = regularUsers.filter(u => !grantedIds.has(u.id));

  return (
    <div className={`rounded-2xl border-2 ${a.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${a.bg} px-5 py-4 flex items-start justify-between gap-4`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${a.icon}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{module.label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
          </div>
        </div>
        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${a.badge}`}>
          {grantedUsers.length + admins.length} user{(grantedUsers.length + admins.length) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4 space-y-4">
        {/* Admins */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Crown className="w-3 h-3" /> Admins — Always Full Access
          </p>
          <div className="flex flex-wrap gap-2">
            {admins.map(u => (
              <div key={u.id} className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full pl-1 pr-3 py-1">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">
                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-amber-800 truncate max-w-[130px]">{u.full_name || u.email}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Granted users */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Granted Access
          </p>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {grantedUsers.length === 0
              ? <p className="text-xs text-slate-400 italic self-center">No users granted yet</p>
              : grantedUsers.map(u => <UserPill key={u.id} user={u} onRemove={u => onRevoke(u, module)} />)
            }
          </div>
        </div>

        <AddUserDropdown available={available} onAdd={u => onGrant(u, module)} />
      </div>
    </div>
  );
}

// ─── Team Members Panel ────────────────────────────────────────────────────
function TeamMembersPanel() {
  var [members, setMembers] = useState(getStoredMembers);
  var [newName, setNewName] = useState('');

  function handleAdd() {
    var t = newName.trim();
    if (!t) return;
    if (members.includes(t)) { toast.error('Already exists'); return; }
    var updated = [...members, t];
    setMembers(updated); saveMembers(updated); setNewName('');
    toast.success(t + ' added');
  }

  function handleRemove(name) {
    var updated = members.filter(m => m !== name);
    setMembers(updated); saveMembers(updated);
  }

  function handleReset() {
    setMembers(DEFAULT_MEMBERS); saveMembers(DEFAULT_MEMBERS);
    toast.success('Reset to defaults');
  }

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
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
  var queryClient = useQueryClient();

  var { data: rawUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Normalize: role lives at top-level u.role; permissions inside u.data
  var allUsers = rawUsers.map(u => ({
    ...u,
    role: u.role || 'user',
    data: u.data || {},
  }));

  function grantAccess(user, module) {
    base44.functions.invoke('updateUserAccess', { targetUserId: user.id, moduleKey: module.key, value: true })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['all-users'] });
        toast.success(`${user.full_name || user.email} granted access to ${module.label}`);
      })
      .catch(err => toast.error('Failed: ' + (err.message || err)));
  }

  function revokeAccess(user, module) {
    base44.functions.invoke('updateUserAccess', { targetUserId: user.id, moduleKey: module.key, value: false })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['all-users'] });
        toast.success(`Access to ${module.label} removed for ${user.full_name || user.email}`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Module Access Control
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Admins always have full access. Toggle module access for regular users below.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {allUsers.length} user{allUsers.length !== 1 ? 's' : ''} registered
          &nbsp;·&nbsp; {allUsers.filter(u => u.role === 'admin').length} admin
          {allUsers.filter(u => u.role === 'admin').length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Module cards */}
      <div className="grid gap-4">
        {MODULES.map(module => (
          <ModuleCard
            key={module.key}
            module={module}
            allUsers={allUsers}
            onGrant={grantAccess}
            onRevoke={revokeAccess}
          />
        ))}
      </div>

      {/* Team members (merged) */}
      <TeamMembersPanel />
    </div>
  );
}

export { getStoredMembers };