import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/Header';
import CurrenciesSettings from '@/components/settings/CurrenciesSettings';
import AppInfoSettings from '@/components/settings/AppInfoSettings';
import UserAccessSettings from '@/components/settings/UserAccessSettings';
import { DollarSign, Settings2, ShieldCheck } from 'lucide-react';

const TABS = [
  { id: 'access', label: 'User Access & Team', icon: ShieldCheck },
  { id: 'currencies', label: 'Currencies', icon: DollarSign },
  { id: 'app', label: 'App Info', icon: Settings2 },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('access');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="pt-28 flex items-center justify-center">
          <p className="text-slate-500">Access denied - admins only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 max-w-4xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

        <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(function(tab) {
            var TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={function() { setActiveTab(tab.id); }}
                className={
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
                  (activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                }
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          {activeTab === 'access' && <UserAccessSettings />}
          {activeTab === 'currencies' && <CurrenciesSettings />}
          {activeTab === 'app' && <AppInfoSettings />}
        </div>
      </div>
    </div>
  );
}