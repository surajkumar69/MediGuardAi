"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { InteractionCard } from "@/components/InteractionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, CheckCircle2, ShieldAlert, ShieldCheck, ShieldHalf, Loader2, ExternalLink, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface InteractionData {
  drug_a?: string;
  drug_b?: string;
  medicine?: string;
  food?: string;
  severity: "high" | "moderate" | "low";
  description: string;
  clinical_effect?: string;
  recommendation: string;
  source_name: string;
  source_url?: string;
}

interface PrescriptionCheck {
  id: string;
  prescription_name: string;
  medicines_detected: string[];
  interactions_found: InteractionData[];
  highest_severity: "low" | "moderate" | "high" | null;
  created_at: string;
}

import { Suspense } from "react";

function CheckDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [check, setCheck] = useState<PrescriptionCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    async function fetchCheck() {
      if (!id) return;
      
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("prescription_checks")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCheck(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCheck();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-lg">Loading screening report...</p>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="bg-rose-50 text-rose-600 p-8 rounded-2xl border border-rose-200">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p className="mb-6">{error || "The requested prescription check could not be found."}</p>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const shortId = `CASE-${check.id.substring(0, 6).toUpperCase()}`;
  const drugInteractions = check.interactions_found?.filter(i => i.drug_a) || [];
  const foodInteractions = check.interactions_found?.filter(i => i.food) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl print:p-0 print:m-0 print:max-w-none">
      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">MediGuard AI</h1>
        <h2 className="text-xl font-semibold text-slate-700">Medication Interaction Screening Report</h2>
      </div>

      <div className="mb-6 print:hidden">
        <Button variant="ghost" className="text-slate-500 hover:text-slate-800 -ml-4" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 print:hidden">Screening Report: {shortId}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(check.created_at).toLocaleString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> {check.medicines_detected?.length || 0} Medicines</span>
            <span className="hidden print:inline">• Case ID: {shortId}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 self-start print:hidden">
          <Button variant="outline" className="shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / Save as PDF
          </Button>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setLanguage('en')} 
              className={cn("px-4 py-1.5 text-sm rounded-md font-medium transition-colors", language === 'en' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('hi')} 
              className={cn("px-4 py-1.5 text-sm rounded-md font-medium transition-colors", language === 'hi' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Screening Summary */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b">Screening Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-wider">Case ID</p>
            <p className="font-mono text-lg font-bold text-slate-800">{shortId}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-wider">Medicines</p>
            <p className="text-lg font-bold text-slate-800">{check.medicines_detected?.length || 0}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-wider">Interactions</p>
            <p className="text-lg font-bold text-slate-800">{check.interactions_found?.length || 0}</p>
          </div>
          <div className={cn("p-4 rounded-xl border", 
            check.highest_severity === 'high' ? "bg-rose-50 border-rose-200" :
            check.highest_severity === 'moderate' ? "bg-amber-50 border-amber-200" :
            "bg-emerald-50 border-emerald-200"
          )}>
            <p className="text-sm font-medium mb-1 uppercase tracking-wider opacity-80">Highest Severity</p>
            <div className="flex items-center gap-2">
              {check.highest_severity === 'high' ? <ShieldAlert className="h-5 w-5 text-rose-600" /> :
               check.highest_severity === 'moderate' ? <ShieldHalf className="h-5 w-5 text-amber-600" /> :
               <ShieldCheck className="h-5 w-5 text-emerald-600" />}
              <p className="text-lg font-bold capitalize">{check.highest_severity || "Low"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Medicines Detected */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b">Medicines Detected</h2>
        {(!check.medicines_detected || check.medicines_detected.length === 0) ? (
          <p className="text-slate-500 italic">No medicines were processed in this check.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {check.medicines_detected.map((med, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <span className="font-semibold text-slate-700 capitalize truncate" title={med}>{med}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactions */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b">Interaction Details</h2>
        
        {check.interactions_found?.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-emerald-800">No Critical Interactions</h3>
            <p className="text-emerald-600 text-sm">No documented drug-drug or drug-food interactions were found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {drugInteractions.map((i, idx) => (
              <InteractionCard
                key={`dd-${idx}`}
                type="drug-drug"
                level={i.severity === 'high' ? 'High' : i.severity === 'moderate' ? 'Moderate' : 'Low'}
                item1={i.drug_a!}
                item2={i.drug_b!}
                description={i.description}
                clinicalEffect={i.clinical_effect}
                recommendation={i.recommendation}
                sourceName={i.source_name}
                sourceUrl={i.source_url}
                language={language}
              />
            ))}
            {foodInteractions.map((i, idx) => (
              <InteractionCard
                key={`df-${idx}`}
                type="drug-food"
                level={i.severity === 'high' ? 'High' : i.severity === 'moderate' ? 'Moderate' : 'Low'}
                item1={i.medicine!}
                item2={i.food!}
                description={i.description}
                recommendation={i.recommendation}
                sourceName={i.source_name}
                sourceUrl={i.source_url}
                language={language}
              />
            ))}
          </div>
        )}
      </section>

      {/* Evidence & Sources */}
      {check.interactions_found?.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b">Evidence & Sources</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {check.interactions_found.map((i, idx) => (
                <li key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-800 capitalize">
                      {i.drug_a ? `${i.drug_a} + ${i.drug_b}` : `${i.medicine} + ${i.food}`}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Source: <span className="font-medium text-slate-700">{i.source_name || "Unknown"}</span></p>
                  </div>
                  
                  {i.source_url ? (
                    <Link href={i.source_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-primary border-primary/20 hover:bg-primary/5">
                        View External Source <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400 italic px-3 py-1.5 bg-slate-100 rounded-md">Source unavailable</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {/* Print-only Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
        <p><strong>Medical Disclaimer:</strong> This tool is for informational and screening purposes only. It does not replace professional medical advice. AI-generated explanations are informational and do not replace professional medical judgment. Consult a qualified healthcare professional.</p>
        <p className="mt-2">Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function CheckDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-lg">Loading screening report...</p>
      </div>
    }>
      <CheckDetailsContent />
    </Suspense>
  );
}
