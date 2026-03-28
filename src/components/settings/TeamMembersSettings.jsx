import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TEAM_MEMBERS } from '@/lib/constants';
import { X, Plus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

// In-memory override - persisted via localStorage for simplicity
const STORAGE_KEY = 'ssg_team_members';

function getMembers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : TEAM_MEMBERS;
  } catch {
    return TEAM_MEMBERS;
  }
}

function saveMembers(members) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export default function TeamMembersSettings() {
  const [members, setMembers] = useState(getMembers);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (members.includes(trimmed)) {
      toast.error('Member already exists');
      return;
    }
    const updated = [...members, trimmed];
    setMembers(updated);
    saveMembers(updated);
    setNewName('');
    toast.success(`${trimmed} added`);
  };

  const handleRemove = (name) => {
    const updated = members.filter(m => m !== name);
    setMembers(updated);
    saveMembers(updated);
    toast.success(`${name} removed`);
  };

  const handleReset = () => {
    setMembers(TEAM_MEMBERS);
    saveMembers(TEAM_MEMBERS);
    toast.success('Reset to defaults');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Team Members
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">These names appear in the Team Member dropdown when creating orders.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>Reset to default</Button>
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="New member name..."
          className="h-9"
        />
        <Button size="sm" onClick={handleAdd} className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* List */}
      <div className="flex flex-wrap gap-2">
        {members.map(name => (
          <span key={name} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full">
            {name}
            <button onClick={() => handleRemove(name)} className="text-slate-400 hover:text-destructive transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// Export helper for other components to read current members
export { getMembers };