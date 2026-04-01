import { useState, useEffect } from 'react';
import { getDrafts, deleteDraft } from '@/lib/orderDrafts';
import { Button } from '@/components/ui/button';
import { FileEdit, Trash2, Zap, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function OrderDraftsPanel({ onResume, refreshTrigger }) {
  const [drafts, setDrafts] = useState([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setDrafts(getDrafts());
  }, [refreshTrigger]);

  if (drafts.length === 0) return null;

  const handleDelete = (e, draftId) => {
    e.stopPropagation();
    deleteDraft(draftId);
    setDrafts(getDrafts());
  };

  return (
    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">
            Saved Drafts
          </span>
          <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {drafts.length}
          </span>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-amber-500" />
          : <ChevronDown className="w-4 h-4 text-amber-500" />}
      </button>

      {expanded && (
        <div className="border-t border-amber-200 divide-y divide-amber-100">
          {drafts.map(draft => {
            const isDirect = draft.fulfillment_type === 'direct_express';
            return (
              <div
                key={draft.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-amber-100/40 transition-colors cursor-pointer group"
                onClick={() => onResume(draft.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDirect ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    {isDirect
                      ? <Zap className="w-3.5 h-3.5 text-purple-600" />
                      : <Package className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {draft.product_name || 'Unnamed Draft'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {draft.supplier_name ? `${draft.supplier_name} · ` : ''}
                      {draft.source_platform}
                      {' · '}
                      <span className="text-amber-600">
                        {formatDistanceToNow(new Date(draft.savedAt), { addSuffix: true })}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-amber-300 bg-white text-amber-700 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onResume(draft.id)}
                  >
                    Resume →
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(e, draft.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}