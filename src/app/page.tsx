import Link from "next/link";
import { ArrowRight, Activity, Pill, Languages, ShieldCheck, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 shadow-sm">
          <ShieldCheck className="mr-2 h-4 w-4" />
          <span>Protecting Patients from Polypharmacy Risks</span>
        </div>

        <h1 className="max-w-4xl text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Check Medication Interactions <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Before They Become a Problem.
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
          Our advanced AI analyzes prescriptions to detect critical drug-drug and drug-food interactions, ensuring patient safety in polypharmacy treatments.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="w-full sm:w-auto rounded-full text-base px-8 h-14 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Link href="/checker">
              Check Prescription <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full text-base px-8 h-14 bg-white/50 backdrop-blur-sm hover:bg-slate-50 transition-all">
            <Link href="#how-it-works">
              How It Works
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive Safety Screening</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Detect hidden risks in complex medication regimens instantly.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Drug-Drug Interaction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-slate-600">
                Identify conflicting medications that may reduce efficacy or cause adverse health effects when taken together.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Pill className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Drug-Food Interaction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-slate-600">
                Ensure dietary habits don&apos;t interfere with medication absorption or trigger dangerous side effects.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Languages className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Regional Language Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-slate-600">
                Break down language barriers. Receive clear, understandable safety warnings in multiple regional languages.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why MediGuard AI Section */}
      <section className="w-full bg-white border-y border-slate-200 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why MediGuard AI?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Built for safety, speed, and transparency in clinical and personal settings.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">1. Prescription-to-Interaction</h3>
              <p className="text-sm text-slate-600">Upload a prescription instead of manually entering every medicine one by one.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">2. Evidence-First</h3>
              <p className="text-sm text-slate-600">Interaction detection comes from structured verified database records, not LLM guesses.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">3. Explainable AI</h3>
              <p className="text-sm text-slate-600">AI converts verified interaction information into simple, understandable language.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Languages className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">4. Inclusive Access</h3>
              <p className="text-sm text-slate-600">Features native English and Hindi explanations with built-in voice synthesis.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
