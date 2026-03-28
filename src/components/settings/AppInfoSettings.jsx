import { Settings2, Info } from 'lucide-react';

var INFO_ROWS = [
  { label: 'App Name', value: 'SSG OPS' },
  { label: 'Version', value: '2.0' },
  { label: 'Built on', value: 'Base44' },
  { label: 'Stack', value: 'React + Tailwind CSS' },
  { label: 'Modules', value: 'TradeFlow, PCS, Document Hub, Training Portal' },
  { label: 'Support', value: 'admin@ssgops.com' },
];

export default function AppInfoSettings() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> App Information
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">General information about this application.</p>
      </div>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
        {INFO_ROWS.map(function(row) {
          return (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="text-sm font-medium text-slate-800">{row.value}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>To make deeper configuration changes, contact your system administrator.</span>
      </div>
    </div>
  );
}