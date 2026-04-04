import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AnimationPreview() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 px-4 md:px-6 pb-8 max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-4">🧪</p>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Preview Sandbox</h1>
          <p className="text-slate-500 text-sm">This page is ready for new previews. Ask me to add one!</p>
        </div>
      </div>
    </div>
  );
}