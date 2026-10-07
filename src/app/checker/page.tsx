"use client";

import { useState } from "react";
import { UploadBox } from "@/components/UploadBox";
import { InteractionCard } from "@/components/InteractionCard";
import { MedicineReviewCard } from "@/components/MedicineReviewCard";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Info, ChevronRight, FileText, CheckCircle2 } from "lucide-react";
import { ExtractedMedicine } from "@/lib/ocr/extractor";
import { cn } from "@/lib/utils";

type Severity = "low" | "moderate" | "high";

interface DrugInteraction {
  id: string;
  drug_a: string;
  drug_b: string;
  severity: Severity;
  title: string;
  description: string;
  clinical_effect: string;
  recommendation: string;
  source_name: string;
  source_url?: string;
}

interface FoodInteraction {
  id: string;
  medicine: string;
  food: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  source_name: string;
  source_url?: string;
}

type Step = 'upload' | 'review' | 'results';

type Language = "en" | "hi";

export default function CheckerPage() {
  const [step, setStep] = useState<Step>('upload');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [viewMode, setViewMode] = useState<"patient" | "professional">("patient");
  
  // OCR Data
  const [rawOcrText, setRawOcrText] = useState("");
  const [isDemoOcr, setIsDemoOcr] = useState(false);
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
  const [showRawText, setShowRawText] = useState(false);
  const [manualMedInput, setManualMedInput] = useState("");

  // Interaction Data
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [foodInteractions, setFoodInteractions] = useState<FoodInteraction[]>([]);
  const [highestSeverity, setHighestSeverity] = useState<Severity | null>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [loadingText, setLoadingText] = useState("Reading prescription...");
  const [skippedOcr, setSkippedOcr] = useState(false);

  const handleManualEntry = () => {
    setError(null);
    setSkippedOcr(true);
    setStep('review');
    setExtractedMedicines([]);
    setRawOcrText("");
    setIsDemoOcr(false);
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setSkippedOcr(false);
    setIsExtracting(true);
    setLoadingText("Reading prescription...");
    
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === "Reading prescription...") return "Extracting medicines...";
        if (prev === "Extracting medicines...") return "Verifying medicines...";
        return prev;
      });
    }, 1500);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to process image");
      }
      
      setRawOcrText(data.text);
      setIsDemoOcr(data.isDemo);
      setExtractedMedicines(data.extractedMedicines || []);
      setStep('review');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      clearInterval(interval);
      setIsExtracting(false);
    }
  };

  const handleUpdateMedicine = (oldName: string, newName: string) => {
    setExtractedMedicines(prev => 
      prev.map(m => m.name === oldName ? { ...m, name: newName.toLowerCase(), needsVerification: false } : m)
    );
  };

  const handleRemoveMedicine = (name: string) => {
    setExtractedMedicines(prev => prev.filter(m => m.name !== name));
  };

  const handleAddManualMedicine = () => {
    const val = manualMedInput.trim().toLowerCase();
    if (val && !extractedMedicines.find(m => m.name === val)) {
      setExtractedMedicines([...extractedMedicines, {
        name: val,
        originalText: "Manual Entry",
        confidence: 100,
        needsVerification: false
      }]);
      setManualMedInput("");
    }
  };

  const handleCheckInteractions = async () => {
    const meds = extractedMedicines.map(m => m.name);
    if (meds.length === 0) {
      setError("Please add at least one medicine to check.");
      return;
    }
    
    setError(null);
    setDrugInteractions([]);
    setFoodInteractions([]);
    setHighestSeverity(null);
    setIsChecking(true);

    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: meds }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to check interactions");
      }
      
      setDrugInteractions(data.drugInteractions || []);
      setFoodInteractions(data.foodInteractions || []);
      setHighestSeverity(data.highestSeverity);
      setStep('results');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Prescription Checker</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Upload a prescription to automatically extract medications and check for potential drug-drug or drug-food interactions.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10 text-sm font-medium">
        <div className={step === 'upload' || isExtracting ? 'text-primary' : 'text-slate-400'}>1. Upload</div>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <div className={step === 'review' ? 'text-primary' : 'text-slate-400'}>2. Review OCR</div>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <div className={step === 'results' || isChecking ? 'text-primary' : 'text-slate-400'}>3. Results</div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Step 1 & 2: Upload / Extracting */}
      {(step === 'upload' || isExtracting) && (
        <div className="relative mb-12">
          <UploadBox onFileSelect={handleFileUpload} onManualEntry={handleManualEntry} isLoading={isExtracting} />
          
          {isExtracting && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl border">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Processing Prescription...</h3>
              <p className="text-slate-500 mt-2">{loadingText}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {skippedOcr ? 'Enter Medicines Manually' : 'Review Detected Medicines'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {skippedOcr 
                    ? 'Add medicines below to check for interactions.'
                    : 'Please verify the extracted medicines before checking interactions.'}
                </p>
              </div>
              {isDemoOcr && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">DEMO OCR MODE</span>
              )}
            </div>

            {extractedMedicines.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 mb-6">
                <Info className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                {skippedOcr ? (
                  <>
                    <p className="text-slate-600 font-medium">Manual Entry Mode</p>
                    <p className="text-slate-500 text-sm mt-1">Please enter your medicines one by one below.</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600 font-medium">No medicines could be confidently detected from the image.</p>
                    <p className="text-slate-500 text-sm mt-1">Please add them manually below.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-3 mb-6">
                {extractedMedicines.map((med, idx) => (
                  <MedicineReviewCard 
                    key={idx} 
                    medicine={med} 
                    onUpdate={handleUpdateMedicine}
                    onRemove={handleRemoveMedicine}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-8 pt-4 border-t border-slate-100">
              <input
                type="text"
                className="flex-1 h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Add missing medicine manually (e.g. Aspirin)"
                value={manualMedInput}
                onChange={(e) => setManualMedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManualMedicine()}
              />
              <Button onClick={handleAddManualMedicine} variant="secondary">Add Medicine</Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {!skippedOcr ? (
                <Button variant="ghost" onClick={() => setShowRawText(!showRawText)} className="text-slate-500 hover:text-slate-700">
                  <FileText className="h-4 w-4 mr-2" />
                  {showRawText ? "Hide Raw OCR Text" : "View Raw OCR Text"}
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('upload')}>Start Over</Button>
                <Button 
                  onClick={handleCheckInteractions} 
                  disabled={extractedMedicines.length === 0 || extractedMedicines.some(m => m.needsVerification)}
                  className="shadow-md"
                >
                  <Search className="mr-2 h-4 w-4" /> Check Interactions
                </Button>
              </div>
            </div>

            {showRawText && (
              <div className="mt-4 p-4 bg-slate-900 text-slate-300 rounded-xl text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                {rawOcrText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4 & 5: Checking / Results */}
      {(isChecking || step === 'results') && (
        <div className="space-y-6 relative min-h-[300px] animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-slate-800">Analysis Results</h2>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setLanguage('en')} 
                  className={cn("px-3 py-1 text-sm rounded-md font-medium transition-colors", language === 'en' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('hi')} 
                  className={cn("px-3 py-1 text-sm rounded-md font-medium transition-colors", language === 'hi' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                >
                  हिंदी
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                <button 
                  onClick={() => setViewMode('patient')} 
                  className={cn("px-3 py-1.5 text-sm rounded-md font-medium transition-colors", viewMode === 'patient' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500")}
                >
                  Patient-Friendly View
                </button>
                <button 
                  onClick={() => setViewMode('professional')} 
                  className={cn("px-3 py-1.5 text-sm rounded-md font-medium transition-colors", viewMode === 'professional' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                >
                  Professional View
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep('review')}>
                Back to Review
              </Button>
            </div>
          </div>
          
          {isChecking && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Checking interactions...</p>
            </div>
          )}
          
          {step === 'results' && drugInteractions.length === 0 && foodInteractions.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">No Known Interactions Found</h3>
              <p className="text-emerald-600 max-w-md mx-auto">
                We did not find any critical drug-drug or drug-food interactions for the provided medications in our database.
              </p>
            </div>
          )}

          {step === 'results' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {/* Medication Safety Summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Medication Safety Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Medicines Checked</p>
                    <p className="text-2xl font-bold text-slate-900">{extractedMedicines.length}</p>
                    <p className="text-xs text-amber-600 mt-1 font-medium">{extractedMedicines.filter(m => m.needsVerification).length} requiring verification</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Drug-Drug</p>
                    <p className="text-2xl font-bold text-slate-900">{drugInteractions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Drug-Food</p>
                    <p className="text-2xl font-bold text-slate-900">{foodInteractions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Highest Severity</p>
                    <p className={cn("text-2xl font-bold capitalize", 
                      highestSeverity === 'high' ? 'text-rose-600' : 
                      highestSeverity === 'moderate' ? 'text-amber-600' : 
                      'text-emerald-600'
                    )}>
                      {highestSeverity || 'None'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interaction Network Visualization */}
              {(drugInteractions.length > 0 || foodInteractions.length > 0) && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Interaction Network</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                      <span className="text-rose-600">High Risk ↕</span>
                      <span className="text-amber-600">Mod Risk ↕</span>
                      <span className="text-emerald-600">Low Risk ↕</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 overflow-x-auto min-w-max pb-2 snap-x">
                    {drugInteractions.map((i, idx) => (
                      <div key={`net-dd-${idx}`} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm snap-center">
                        <span className="font-semibold text-slate-800 capitalize">{i.drug_a}</span>
                        <div className="flex flex-col items-center px-2">
                          <span className={cn("text-[10px] font-bold uppercase", i.severity === 'high' ? 'text-rose-600' : i.severity === 'moderate' ? 'text-amber-600' : 'text-emerald-600')}>{i.severity}</span>
                          <span className={cn("text-lg font-bold leading-none", i.severity === 'high' ? 'text-rose-400' : i.severity === 'moderate' ? 'text-amber-400' : 'text-emerald-400')}>↔</span>
                        </div>
                        <span className="font-semibold text-slate-800 capitalize">{i.drug_b}</span>
                      </div>
                    ))}
                    {foodInteractions.map((i, idx) => (
                      <div key={`net-df-${idx}`} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm snap-center">
                        <span className="font-semibold text-slate-800 capitalize">{i.medicine}</span>
                        <div className="flex flex-col items-center px-2">
                          <span className={cn("text-[10px] font-bold uppercase", i.severity === 'high' ? 'text-rose-600' : i.severity === 'moderate' ? 'text-amber-600' : 'text-emerald-600')}>{i.severity}</span>
                          <span className={cn("text-lg font-bold leading-none", i.severity === 'high' ? 'text-rose-400' : i.severity === 'moderate' ? 'text-amber-400' : 'text-emerald-400')}>↔</span>
                        </div>
                        <span className="font-semibold text-slate-800 capitalize bg-orange-50 px-2 py-0.5 rounded text-sm">{i.food}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6">
                {drugInteractions.map((interaction) => (
                <div key={interaction.id} className="relative">
                  <InteractionCard 
                    type="drug-drug"
                    level={interaction.severity === 'high' ? 'High' : interaction.severity === 'moderate' ? 'Moderate' : 'Low'}
                    item1={interaction.drug_a}
                    item2={interaction.drug_b}
                    description={interaction.description}
                    clinicalEffect={interaction.clinical_effect}
                    recommendation={interaction.recommendation}
                    sourceName={interaction.source_name}
                    sourceUrl={interaction.source_url}
                    language={language}
                    viewMode={viewMode}
                  />
                </div>
              ))}
              
              {foodInteractions.map((interaction) => (
                <div key={interaction.id} className="relative">
                  <InteractionCard 
                    type="drug-food"
                    level={interaction.severity === 'high' ? 'High' : interaction.severity === 'moderate' ? 'Moderate' : 'Low'}
                    item1={interaction.medicine}
                    item2={interaction.food}
                    description={interaction.description}
                    recommendation={interaction.recommendation}
                    sourceName={interaction.source_name}
                    sourceUrl={interaction.source_url}
                    language={language}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
