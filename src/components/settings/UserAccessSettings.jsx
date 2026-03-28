import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, Plus, X, Users, FileSpreadsheet, TrendingUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MODULES = [
  {
    key: 'can_access_pcs',
    label: 'PCS Module',
    description: 'Price Comparison Sheets - procurement quoting workflow',
    icon: FileSpreadsheet,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badgeColor: 'bg-red-100 text-red-700',
  },
  {
    key: 'can_access_tradeflow',
    label: 'TradeFlow Module',
    description: 'Orders, Shipments, Customers & Suppliers management',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badgeColor: 'bg-indigo-100 text-indigo-700',
  },
];

function UserPill({ user, onRemove }) {
  const initials = (user.full_name || user.email || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1 pr-2 py-1 shadow-sm">
      <div className="w-6 h-6 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        {initials}
      </div>
      <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
        {user.full_name || user.email}
      </span>
      <button
        onClick={() => onRemove(user)}
        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AddUserDropdown({ available, onAdd }) {
  const [open, setOpen] = useState(false);

  if (available.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs h-8 border-dashed"
        onClick={() => setOpen(o => !o)}
      >
        <Plus className="w-3.5 h-3.5" />
        Add User
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg w-56 py-1 overflow-hidden">
            {available.map(u => (
              <button
                key={u.id}
                onClick={() => { onAdd(u); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{u.full_name || '-'}</p>
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

function ModuleCard({ module, users, allUsers, onAdd, onRemove }) {
  const Icon = module.icon;
  const regularUsers = allUsers.filter(u => u.role !== 'admin');
  const grantedIds = new Set(users.map(u => u.id));
  const available = regularUsers.filter(u => !grantedIds.has(u.id));
  const admins = allUsers.filter(u => u.role === 'admin');

  return (
    <div className={`rounded-2xl border-2 ${module.border} overflow-hidden`}>
      <div className={`${module.bg} px-5 py-4 flex items-start justify-between gap-4`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl ${module.bg} border ${module.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${module.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{module.label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
          </div>
        </div>
        <div className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${module.badgeColor}`}>
          {users.length} user{users.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="bg-white px-5 py-4 space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Admins - Always Full Access
          </p>
          <div className="flex flex-wrap gap-2">
            {admins.map(u => (
              <div key={u.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full pl-1 pr-3 py-1">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">
                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-amber-800 truncate max-w-[120px]">
                  {u.full_name || u.email}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Granted Access
          </p>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {users.length === 0 ? (
              <p className="text-xs text-slate-400 italic self-center">No users granted yet</p>
            ) : (
              users.map(u => (
                <UserPill key={u.id} user={u} onRemove={onRemove} />
              ))
            )}
          </div>
        </div>

        <div className="pt-1">
          <AddUserDropdown available={available} onAdd={onAdd} />
          {available.length === 0 && regularUsers.length > 0 && (
            <p className="text-xs text-slate-400 italic">All users have access</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserAccessSettings() {
  const queryClient = useQueryClient();

  const { data: rawUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Normalize: custom fields live inside user.data on the SDK response
  const users = rawUsers.map(u => ({
    ...u,
    role: u.role || u.data?.role || 'user',
    can_access_pcs: !!(u.data?.can_access_pcs ?? u.can_access_pcs),
    can_access_tradeflow: !!(u.data?.can_access_tradeflow ?? u.can_access_tradeflow),
  }));

  const hasPerm = (user, key) => !!user[key];

  const grantAccess = async (user, moduleKey, moduleLabel) => {
    await base44.entities.User.update(user.id, { data: { ...user.data, [moduleKey]: true } });
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success(`${user.full_name || user.email} granted access to ${moduleLabel}`);
  };

  const revokeAccess = async (user, moduleKey, moduleLabel) => {
    await base44.entities.User.update(user.id, { data: { ...user.data, [moduleKey]: false } });
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success(`Access to ${moduleLabel} removed for ${user.full_name || user.email}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Module Access Control
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Each module has its own access list. Admins always have full access. Add or remove users per module.
        </p>
      </div>

      <div className="grid gap-4">
        {MODULES.map(module => {
          const grantedUsers = users.filter(u => u.role !== 'admin' && hasPerm(u, module.key));
          return (
            <ModuleCard
              key={module.key}
              module={module}
              users={grantedUsers}
              allUsers={users}
              onAdd={user => grantAccess(user, module.key, module.label)}
              onRemove={user => revokeAccess(user, module.key, module.label)}
            />
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        To add a new restricted module, contact your system administrator.
      </p>
    </div>
  );
}