"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RiskBadge } from "./RiskBadge";
import { MedicineBadge } from "./MedicineBadge";
import { AlertCircle, Utensils, Sparkles, Loader2, Volume2, Square, Info, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface ExplanationData {
  summary: string;
  why_it_matters: string;
  possible_concern: string;
  what_to_do: string;
  professional_guidance: string;
  source: string;
}

interface InteractionCardProps {
  type: "drug-drug" | "drug-food";
  level: "High" | "Moderate" | "Low";
  item1: string;
  item2: string;
  description: string;
  clinicalEffect?: string;
  recommendation: string;
  sourceName: string;
  sourceUrl?: string;
  language: "en" | "hi";
  viewMode?: "patient" | "professional";
}

export function InteractionCard({ type, level, item1, item2, description, clinicalEffect, recommendation, sourceName, sourceUrl, language, viewMode = "professional" }: InteractionCardProps) {
  const isFood = type === "drug-food";
  
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleExplain = async () => {
    setIsExplaining(true);
    setExplainError(null);

    try {
      const res = await fetch("/api/explain-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interaction: {
            type,
            medicineA: item1,
            medicineB: item2,
            severity: level,
            description,
            clinicalEffect,
            recommendation,
            sourceName,
            sourceUrl
          },
          language
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to generate explanation");
      }

      setExplanation(data.explanation);
    } catch (err: unknown) {
      setExplainError((err as Error).message);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSpeech = () => {
    if (!explanation) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `${explanation.summary}. ${explanation.why_it_matters}. ${explanation.what_to_do}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="border-l-4 overflow-hidden shadow-md" style={{ borderLeftColor: level === "High" ? "#ef4444" : level === "Moderate" ? "#f59e0b" : "#10b981" }}>
      <CardHeader className="pb-3 bg-slate-50/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isFood ? <Utensils className="h-5 w-5 text-slate-500" /> : <AlertCircle className="h-5 w-5 text-slate-500" />}
            <CardTitle className="text-lg flex items-center gap-2">
              <MedicineBadge name={item1} />
              <span className="text-slate-400 font-normal">interacts with</span>
              {isFood ? (
                <span className="font-semibold text-slate-700 bg-orange-100 px-3 py-1 rounded-full text-sm">{item2}</span>
              ) : (
                <MedicineBadge name={item2} />
              )}
            </CardTitle>
          </div>
          <RiskBadge level={level} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Professional DB Details */}
        {viewMode === "professional" && (
          <div className="space-y-3 text-sm mb-4 border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800">Why was this flagged?</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified from Interaction Knowledge Base
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Verified Description</span>
              <span className="text-slate-600">{description}</span>
            </div>
            {clinicalEffect && (
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Clinical Effect</span>
                <span className="text-slate-600">{clinicalEffect}</span>
              </div>
            )}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
              <span className="font-semibold text-slate-700 block mb-0.5">Professional Guidance</span>
              <span className="text-slate-600">{recommendation}</span>
            </div>
          </div>
        )}

        {/* AI Explanation Area */}
        {!explanation && !isExplaining && !explainError && (
          <Button onClick={handleExplain} variant="outline" className="w-full sm:w-auto text-primary border-primary/20 hover:bg-primary/5">
            <Sparkles className="h-4 w-4 mr-2" />
            Explain This Interaction
          </Button>
        )}

        {isExplaining && (
          <div className="flex items-center gap-2 text-sm text-primary py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating explanation...</span>
          </div>
        )}

        {explainError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-2 mt-4">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>AI explanation is temporarily unavailable. Please review the verified interaction details and source below. ({explainError})</p>
          </div>
        )}

        {explanation && (
          <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-xl border border-indigo-100 relative">
            <div className="absolute top-4 right-4">
              <Button size="icon" variant={isPlaying ? "destructive" : "secondary"} onClick={handleSpeech} className="h-8 w-8 rounded-full shadow-sm">
                {isPlaying ? <Square className="h-3 w-3" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex flex-col gap-1 mb-4 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Sparkles className="h-4 w-4" />
                <h4 className="font-bold">AI Explanation</h4>
              </div>
              <p className="text-xs text-indigo-500 font-medium">
                AI explains verified evidence — it does not determine the interaction.
              </p>
            </div>
            
            <div className="space-y-4 text-sm">
              <p className="text-slate-800 font-medium text-base">{explanation.summary}</p>
              
              <div>
                <strong className="text-slate-700 block mb-1">Why Does This Matter?</strong>
                <p className="text-slate-600">{explanation.why_it_matters}</p>
              </div>
              
              <div>
                <strong className="text-slate-700 block mb-1">Possible Concern</strong>
                <p className="text-slate-600">{explanation.possible_concern}</p>
              </div>
              
              <div className="bg-indigo-50/80 p-3 rounded-lg border border-indigo-100">
                <strong className="text-indigo-900 block mb-1">What Should I Do?</strong>
                <p className="text-indigo-800 mb-2">{explanation.what_to_do}</p>
                <p className="text-xs text-indigo-600/80 italic border-t border-indigo-200/50 pt-2 font-medium">
                  AI-generated explanations are informational and do not replace professional medical judgment. Consult a qualified healthcare professional.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Section */}
        {viewMode === "professional" && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm">
            <h4 className="font-bold text-slate-800 mb-2">Evidence</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Source:</span>
                <span>{sourceName || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Reference:</span>
                {sourceUrl ? (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    View external source <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Source unavailable</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
