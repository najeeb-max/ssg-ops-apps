import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Ship, Users, Building2, Menu, X, LogOut, ArrowLeft, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { label: 'Dashboard', path: '/tradeflow', icon: LayoutDashboard },
  { label: 'Orders', path: '/tradeflow/orders', icon: ShoppingCart },
  { label: 'Shipments', path: '/tradeflow/shipments', icon: Ship },
  { label: 'Customers', path: '/tradeflow/customers', icon: Users },
  { label: 'Suppliers', path: '/tradeflow/suppliers', icon: Building2 },
];

export default function TradeflowLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me(), staleTime: 60_000 });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (user && user.role !== 'admin' && !user.can_access_tradeflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <ShieldOff className="w-12 h-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-700">Access Restricted</h2>
        <p className="text-sm text-slate-500">You don't have permission to access TradeFlow.</p>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">← Back to Portal</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-56 flex-col bg-white border-r border-slate-200 fixed inset-y-0">
        <div className="px-4 py-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 mb-3">
            <ArrowLeft className="w-3 h-3" /> Back to Portal
          </Link>
          <span className="text-lg font-bold text-indigo-700 tracking-tight">TradeFlow</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-indigo-700">TradeFlow</span>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="bg-white w-64 h-full p-4 space-y-1" onClick={e => e.stopPropagation()}>
            <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 mb-4 mt-2">
              <ArrowLeft className="w-3 h-3" /> Back to Portal
            </Link>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-56 pt-0 md:pt-0">
        <div className="md:hidden h-14" />
        <Outlet />
      </main>
    </div>
  );
}