import { AlertTriangle, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function UnsavedDraftDialog({ open, onDiscard, onKeep, onCancel }) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <AlertDialogTitle>Unsaved Order Data</AlertDialogTitle>
          <AlertDialogDescription>
            You've entered data that hasn't been saved as an order yet. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}