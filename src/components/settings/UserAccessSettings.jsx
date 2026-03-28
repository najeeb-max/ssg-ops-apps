import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, Plus, X, Users, FileSpreadsheet, TrendingUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

var MODULES = [
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
    description: 'Orders, Shipments, Customers and Suppliers management',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badgeColor: 'bg-indigo-100 text-indigo-700',
  },
];

function UserPill(props) {
  var user = props.user;
  var onRemove = props.onRemove;
  var initials = (user.full_name || user.email || '?')
    .split(' ')
    .map(function(w) { return w[0]; })
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
        onClick={function() { onRemove(user); }}
        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AddUserDropdown(props) {
  var available = props.available;
  var onAdd = props.onAdd;
  var [open, setOpen] = useState(false);

  if (available.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs h-8 border-dashed"
        onClick={function() { setOpen(function(o) { return !o; }); }}
      >
        <Plus className="w-3.5 h-3.5" />
        Add User
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={function() { setOpen(false); }} />
          <div className="absolute left-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg w-56 py-1 overflow-hidden">
            {available.map(function(u) {
              return (
                <button
                  key={u.id}
                  onClick={function() { onAdd(u); setOpen(false); }}
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ModuleCard(props) {
  var module = props.module;
  var users = props.users;
  var allUsers = props.allUsers;
  var onAdd = props.onAdd;
  var onRemove = props.onRemove;
  var Icon = module.icon;
  var regularUsers = allUsers.filter(function(u) { return u.role !== 'admin'; });
  var grantedIds = new Set(users.map(function(u) { return u.id; }));
  var available = regularUsers.filter(function(u) { return !grantedIds.has(u.id); });
  var admins = allUsers.filter(function(u) { return u.role === 'admin'; });

  return (
    <div className={'rounded-2xl border-2 ' + module.border + ' overflow-hidden'}>
      <div className={module.bg + ' px-5 py-4 flex items-start justify-between gap-4'}>
        <div className="flex items-start gap-3">
          <div className={'w-9 h-9 rounded-xl ' + module.bg + ' border ' + module.border + ' flex items-center justify-center flex-shrink-0'}>
            <Icon className={'w-5 h-5 ' + module.color} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{module.label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
          </div>
        </div>
        <div className={'flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ' + module.badgeColor}>
          {users.length + admins.length} user{(users.length + admins.length) !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="bg-white px-5 py-4 space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Admins - Always Full Access
          </p>
          <div className="flex flex-wrap gap-2">
            {admins.map(function(u) {
              return (
                <div key={u.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full pl-1 pr-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">
                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-amber-800 truncate max-w-[120px]">
                    {u.full_name || u.email}
                  </span>
                </div>
              );
            })}
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
              users.map(function(u) {
                return <UserPill key={u.id} user={u} onRemove={onRemove} />;
              })
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
  var queryClient = useQueryClient();

  var queryResult = useQuery({
    queryKey: ['all-users'],
    queryFn: function() { return base44.entities.User.list(); },
  });
  var rawUsers = queryResult.data || [];
  var isLoading = queryResult.isLoading;

  var users = rawUsers.map(function(u) {
    // The User entity stores custom fields inside u.data at the top level
    var d = u.data || {};
    return Object.assign({}, u, {
      role: u.role || d.role || 'user',
      can_access_pcs: !!(d.can_access_pcs),
      can_access_tradeflow: !!(d.can_access_tradeflow),
    });
  });

  function hasPerm(user, key) {
    return !!user[key];
  }

  function grantAccess(user, moduleKey, moduleLabel) {
    base44.functions.invoke('updateUserAccess', { targetUserId: user.id, moduleKey: moduleKey, value: true })
      .then(function() {
        queryClient.invalidateQueries({ queryKey: ['all-users'] });
        toast.success((user.full_name || user.email) + ' granted access to ' + moduleLabel);
      }).catch(function(err) {
        toast.error('Failed to grant access: ' + (err.message || err));
      });
  }

  function revokeAccess(user, moduleKey, moduleLabel) {
    base44.functions.invoke('updateUserAccess', { targetUserId: user.id, moduleKey: moduleKey, value: false })
      .then(function() {
        queryClient.invalidateQueries({ queryKey: ['all-users'] });
        toast.success('Access to ' + moduleLabel + ' removed for ' + (user.full_name || user.email));
      }).catch(function(err) {
        toast.error('Failed to revoke access: ' + (err.message || err));
      });
  }

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
        {MODULES.map(function(module) {
          var grantedUsers = users.filter(function(u) {
            return u.role !== 'admin' && hasPerm(u, module.key);
          });
          return (
            <ModuleCard
              key={module.key}
              module={module}
              users={grantedUsers}
              allUsers={users}
              onAdd={function(user) { grantAccess(user, module.key, module.label); }}
              onRemove={function(user) { revokeAccess(user, module.key, module.label); }}
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