"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, ShieldCheck, ShieldHalf, Activity, Search, 
  Calendar, FileText, ArrowRight, Loader2, Info
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InteractionFoundType {
  drug_a?: string;
  food?: string;
  [key: string]: unknown;
}

// Define DB Types
interface PrescriptionCheck {
  id: string;
  prescription_name: string;
  medicines_detected: string[];
  interactions_found: InteractionFoundType[];
  highest_severity: "low" | "moderate" | "high" | null;
  created_at: string;
}

export default function DashboardPage() {
  const [checks, setChecks] = useState<PrescriptionCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    async function fetchChecks() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("prescription_checks")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        console.log(`[Dashboard] Query Result: Retrieved ${data?.length || 0} prescription checks from database.`);
        setChecks(data || []);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchChecks();
  }, []);

  // Compute stats
  const totalChecks = checks.length;
  const highRisk = checks.filter(c => c.highest_severity === "high").length;
  const moderateRisk = checks.filter(c => c.highest_severity === "moderate").length;
  const lowRisk = checks.filter(c => c.highest_severity === "low" || c.highest_severity === null).length;
  const totalMedicines = checks.reduce((acc, check) => acc + (check.medicines_detected?.length || 0), 0);

  // Filter Data
  const filteredChecks = checks.filter(check => {
    // Search
    const matchesSearch = 
      check.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (check.medicines_detected && check.medicines_detected.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())));
    if (!matchesSearch) return false;

    // Severity
    if (severityFilter !== "all" && check.highest_severity !== severityFilter) {
      if (!(severityFilter === "low" && check.highest_severity === null)) {
        return false;
      }
    }

    // Interaction Type
    if (typeFilter !== "all") {
      const hasDrugDrug = check.interactions_found?.some(i => i.drug_a);
      const hasDrugFood = check.interactions_found?.some(i => i.food);
      if (typeFilter === "drug-drug" && !hasDrugDrug) return false;
      if (typeFilter === "drug-food" && !hasDrugFood) return false;
    }

    // Date
    if (dateFilter !== "all") {
      const checkDate = new Date(check.created_at);
      // eslint-disable-next-line react-hooks/purity
      const diffTime = Math.abs(Date.now() - checkDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "today" && diffDays > 1) return false;
      if (dateFilter === "7days" && diffDays > 7) return false;
      if (dateFilter === "30days" && diffDays > 30) return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Medication Safety Dashboard</h1>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
            Prototype • Informational Screening
          </span>
        </div>
        <p className="text-slate-600">
          Review prescription screening results and potential medication interactions.
        </p>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 flex justify-end">
          <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={async () => {
            if (confirm("Reset all demo data? This cannot be undone.")) {
              await fetch("/api/reset-demo", { method: "POST" });
              window.location.reload();
            }
          }}>
            Reset Demo Data
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
              <Activity className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : totalChecks}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Total Checks</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-t-rose-500">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center mb-3">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : highRisk}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">High Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-t-amber-500">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <ShieldHalf className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : moderateRisk}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Moderate Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : lowRisk}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Low Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : totalMedicines}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Medicines Checked</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interaction Distribution */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Interaction Distribution</h3>
              {totalChecks === 0 ? (
                <p className="text-sm text-slate-500 italic">Not enough data yet</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> High Risk</span>
                    <span className="font-semibold text-slate-700">{highRisk}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Moderate Risk</span>
                    <span className="font-semibold text-slate-700">{moderateRisk}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Low Risk</span>
                    <span className="font-semibold text-slate-700">{lowRisk}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-300"></span> None</span>
                    <span className="font-semibold text-slate-700">{totalChecks - highRisk - moderateRisk - lowRisk}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Most Frequent Medicines */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Most Frequently Checked</h3>
              {totalMedicines === 0 ? (
                <p className="text-sm text-slate-500 italic">Not enough data yet</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(
                    checks.flatMap(c => c.medicines_detected || []).reduce((acc, med) => {
                      const m = med.toLowerCase();
                      acc[m] = (acc[m] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([med, count], idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-700">{med}</span>
                      <span className="font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Screening Activity Timeline */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Screening Activity</h3>
            {checks.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {checks.slice(0, 4).map((check, idx) => {
                  const checkDate = new Date(check.created_at);
                  // eslint-disable-next-line react-hooks/purity
                  const isToday = checkDate.toDateString() === new Date().toDateString();
                  // eslint-disable-next-line react-hooks/purity
                  const isYesterday = new Date(Date.now() - 86400000).toDateString() === checkDate.toDateString();
                  const dateLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : checkDate.toLocaleDateString();
                  const numInteractions = check.interactions_found?.length || 0;
                  
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                        {idx !== Math.min(checks.length - 1, 3) && <div className="w-0.5 h-full bg-slate-100 my-1"></div>}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-0.5">{dateLabel}</p>
                        <Link href={`/dashboard/check/${check.id}`} className="block hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-colors">
                          <p className="text-sm font-medium text-slate-800">CASE-{check.id.substring(0, 6).toUpperCase()}</p>
                          <p className="text-xs text-slate-600">{numInteractions} interaction{numInteractions !== 1 && 's'}</p>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by medicine or CASE ID..." 
              className="pl-9 h-10 w-full bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <select 
              value={severityFilter} 
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-[140px] h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="low">Low Risk</option>
            </select>

            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="w-[150px] h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="drug-drug">Drug-Drug</option>
              <option value="drug-food">Drug-Food</option>
            </select>

            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              className="w-[130px] h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Loading prescription checks...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 bg-rose-50 m-4 rounded-lg flex items-center justify-center gap-2">
              <Info className="h-5 w-5" /> {error}
            </div>
          ) : filteredChecks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 text-center">
              <FileText className="h-12 w-12 mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-700">No prescription checks yet</h3>
              <p className="mt-1 mb-6">Upload a prescription or enter medicines to start your first screening.</p>
              <Link href="/checker">
                <Button>Start New Check</Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Check ID</th>
                  <th className="px-6 py-4">Medicines</th>
                  <th className="px-6 py-4 text-center">Interactions</th>
                  <th className="px-6 py-4 text-center">Highest Severity</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecks.map((check) => {
                  const shortId = `CASE-${check.id.substring(0, 6).toUpperCase()}`;
                  const numMeds = check.medicines_detected?.length || 0;
                  const numInteractions = check.interactions_found?.length || 0;
                  const severity = check.highest_severity || 'low';
                  
                  return (
                    <tr key={check.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {shortId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {check.medicines_detected?.slice(0, 3).map(med => (
                            <span key={med} className="capitalize text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                              {med}
                            </span>
                          ))}
                          {numMeds > 3 && (
                            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                              +{numMeds - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 font-semibold">
                        {numInteractions}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                          severity === 'high' ? "bg-rose-100 text-rose-700" :
                          severity === 'moderate' ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        )}>
                          {severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(check.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/check/${check.id}`}>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                            View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
