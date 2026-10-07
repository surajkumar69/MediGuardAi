import { AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50/50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">MediGuard AI</span>
            <span className="text-sm text-slate-500">© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-start max-w-2xl bg-amber-50 p-4 rounded-xl border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Medical Disclaimer:</strong> This tool is for informational and screening purposes only. It does not replace professional medical advice. Do not stop, start, or change medication based solely on this tool.<br/><br/>
              <em>AI-generated explanations are based on verified interaction information and should not be used as a substitute for professional medical advice.</em>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
