import { AlertTriangle, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnsavedDraftDialog({ open, onDiscard, onKeep, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Unsaved Order Data</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              You've entered data that hasn't been saved as an order yet. What would you like to do?
            </p>
          </div>

          <div className="w-full space-y-2 pt-1">
            <Button
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={onKeep}
            >
              <Save className="w-4 h-4" />
              Keep Draft — Come Back Later
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              onClick={onDiscard}
            >
              <Trash2 className="w-4 h-4" />
              Discard All Data
            </Button>
            <Button
              variant="ghost"
              className="w-full gap-2 text-slate-500"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
              Go Back to Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}