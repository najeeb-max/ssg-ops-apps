import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link2, Plus, Trash2, Copy, RefreshCw, Globe, Shield } from 'lucide-react';

const TOKEN_KEY = 'china_agent_tokens';

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function ChinaAgentTokenSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const tokens = me?.data?.[TOKEN_KEY] || [];

  async function saveTokens(newTokens) {
    setSaving(true);
    await base44.auth.updateMe({ data: { ...(me?.data || {}), [TOKEN_KEY]: newTokens } });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    setSaving(false);
  }

  async function handleAdd() {
    const token = generateToken();
    await saveTokens([...tokens, token]);
    toast.success('New access link generated');
  }

  async function handleRevoke(token) {
    await saveTokens(tokens.filter(t => t !== token));
    toast.success('Access link revoked');
  }

  function getLink(token) {
    return `${window.location.origin}/china-agent?token=${token}`;
  }

  function copyLink(token) {
    navigator.clipboard.writeText(getLink(token));
    toast.success('Link copied to clipboard');
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4" /> China Agent Portal
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate secret links to share with your China agent. They can view and update China Hub order statuses — no login required.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-800">
          <span className="font-semibold">Security note:</span> Anyone with a link can view China Hub orders and update statuses. Only share with trusted agents. Revoke any link instantly if compromised.
        </div>
      </div>

      {/* Token list */}
      <div className="space-y-2">
        {tokens.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Link2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No access links yet. Generate one to get started.</p>
          </div>
        ) : (
          tokens.map((token, idx) => (
            <div key={token} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 mb-0.5">Agent Link {idx + 1}</p>
                <p className="text-xs font-mono text-slate-400 truncate">{getLink(token)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(token)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(token)}
                  className="h-8 text-slate-400 hover:text-destructive hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        onClick={handleAdd}
        disabled={saving}
        variant="outline"
        className="gap-2 w-full border-dashed"
      >
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Generate New Agent Link
      </Button>
    </div>
  );
}