// Reusable empty state component (Point 11)
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ message = 'No records found.', icon: IconComponent }) {
  const Icon = IconComponent || PackageOpen;
  return (
    <div className="flex flex-col items-center justify-center py-14 text-slate-400">
      <Icon className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}