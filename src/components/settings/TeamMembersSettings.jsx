import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TEAM_MEMBERS } from '@/lib/constants';
import { X, Plus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

var STORAGE_KEY = 'ssg_team_members';

function getMembers() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : TEAM_MEMBERS;
  } catch (e) {
    return TEAM_MEMBERS;
  }
}

function saveMembers(members) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export default function TeamMembersSettings() {
  var [members, setMembers] = useState(getMembers);
  var [newName, setNewName] = useState('');

  function handleAdd() {
    var trimmed = newName.trim();
    if (!trimmed) return;
    if (members.includes(trimmed)) {
      toast.error('Member already exists');
      return;
    }
    var updated = members.concat([trimmed]);
    setMembers(updated);
    saveMembers(updated);
    setNewName('');
    toast.success(trimmed + ' added');
  }

  function handleRemove(name) {
    var updated = members.filter(function(m) { return m !== name; });
    setMembers(updated);
    saveMembers(updated);
    toast.success(name + ' removed');
  }

  function handleReset() {
    setMembers(TEAM_MEMBERS);
    saveMembers(TEAM_MEMBERS);
    toast.success('Reset to defaults');
  }

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

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={function(e) { setNewName(e.target.value); }}
          onKeyDown={function(e) { if (e.key === 'Enter') handleAdd(); }}
          placeholder="New member name..."
          className="h-9"
        />
        <Button size="sm" onClick={handleAdd} className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map(function(name) {
          return (
            <span key={name} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full">
              {name}
              <button onClick={function() { handleRemove(name); }} className="text-slate-400 hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export { getMembers };