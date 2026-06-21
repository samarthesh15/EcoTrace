import React, { useMemo, useState } from "react";
import { 
  FootprintLogEntry, 
  CarbonCategory, 
  CarbonReductionGoal 
} from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  Leaf, 
  Trash2, 
  Calendar, 
  Compass, 
  TrendingDown, 
  Plus, 
  Sparkles,
  Zap,
  Tag
} from "lucide-react";

interface OverviewDashboardProps {
  logs: FootprintLogEntry[];
  activeWeeklySavings: number;
  onAddManualLog: (category: CarbonCategory, name: string, value: number) => void;
  onDeleteLog: (id: string) => void;
  goal: CarbonReductionGoal;
  onUpdateGoal: (newTarget: number) => void;
  aiReport: any;
  onTriggerAiCoach: () => void;
  loadingCoach: boolean;
}

export default function OverviewDashboard({
  logs,
  activeWeeklySavings,
  onAddManualLog,
  onDeleteLog,
  goal,
  onUpdateGoal,
  aiReport,
  onTriggerAiCoach,
  loadingCoach,
}: OverviewDashboardProps) {
  const [manualName, setManualName] = useState("");
  const [manualCo2, setManualCo2] = useState("");
  const [manualCategory, setManualCategory] = useState<CarbonCategory>("lifestyle");
  const [showAddManual, setShowAddManual] = useState(false);

  // Group emissions by category
  const categoryTotals = useMemo(() => {
    const totals: Record<CarbonCategory, number> = {
      transport: 0,
      energy: 0,
      lifestyle: 0,
      diet: 0,
    };
    logs.forEach((log) => {
      // Offset values are substracted, normal entries are added
      const value = log.isOffset ? -log.value : log.value;
      totals[log.category] = (totals[log.category] || 0) + value;
    });
    // Quantize negative categories to 0 for display
    return Object.keys(totals).map((key) => ({
      name: key.toUpperCase(),
      value: Math.max(0, +totals[key as CarbonCategory].toFixed(1)),
      color: 
        key === "transport" ? "#F59E0B" : // Warm amber
        key === "energy" ? "#38BDF8" :       // Electric Sky Blue
        key === "diet" ? "#FB7185" :         // Coral rose
        "#C4FF00"                            // Neon Yellow-Green
    }));
  }, [logs]);

  // Aggregate stats
  const totalAnnualFootprint = useMemo(() => {
    const sum = logs.reduce((acc, log) => {
      return acc + (log.isOffset ? -log.value : log.value);
    }, 0);
    return Math.max(0, +sum.toFixed(1));
  }, [logs]);

  // Convert kg to metric tons
  const footprintInTons = useMemo(() => {
    return (totalAnnualFootprint / 1000).toFixed(2);
  }, [totalAnnualFootprint]);

  const progressPercentage = useMemo(() => {
    if (goal.baseFootprint <= 0) return 0;
    const targetFootprint = goal.baseFootprint * (1 - goal.targetPercentage / 100);
    const reductionNeeded = goal.baseFootprint - targetFootprint;
    const currentReduction = Math.max(0, goal.baseFootprint - totalAnnualFootprint);
    if (reductionNeeded <= 0) return 100;
    return Math.min(100, Math.round((currentReduction / reductionNeeded) * 100));
  }, [totalAnnualFootprint, goal]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualCo2 || isNaN(Number(manualCo2))) return;
    onAddManualLog(manualCategory, manualName.trim(), Math.abs(Number(manualCo2)));
    setManualName("");
    setManualCo2("");
    setShowAddManual(false);
  };

  return (
    <div className="space-y-8" id="overview-dashboard-container">
      {/* Decorative Premium Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-white/10 shadow-sm dark:shadow-none h-48 flex items-center p-6 sm:p-8">
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src="/src/assets/images/clean_horizon_1782071795759.jpg" 
            alt="Eco horizon premium background" 
            className="w-full h-full object-cover opacity-90 dark:opacity-40 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-black/95 dark:via-black/80 dark:to-transparent z-10 transition-colors" />
        </div>
        
        <div className="relative z-20 max-w-lg space-y-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-800 dark:text-[#C4FF00] font-mono font-black py-0.5 px-2 bg-emerald-500/10 dark:bg-[#C4FF00]/10 border border-emerald-500/20 dark:border-[#C4FF00]/25 rounded-md w-fit block">
            ECOTRACING ENGAGED
          </span>
          <h2 className="text-xl sm:text-2xl font-serif italic text-zinc-900 dark:text-white font-extrabold tracking-tight leading-none">
            Measuring Carbon Vectors for a Net-Zero Orbit
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed font-sans max-w-sm">
            Leverage safe high-precision AI modules and verified EPA metrics to steer your ecological trajectory.
          </p>
        </div>
      </div>

      {/* Premium Bento Grid: Separates the Metric display from Goal Controls to prevent crowding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Impact Card */}
        <div className="lg:col-span-7 p-8 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4FF00]/10 dark:bg-[#C4FF00]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 font-mono font-bold block">Yearly Impact Coefficient</span>
            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <span className="text-5xl sm:text-7xl font-sans font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                {footprintInTons}
              </span>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-serif italic text-emerald-600 dark:text-[#C4FF00] font-semibold">Metric Tons</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider">CO2e / ACCOUNT PROFILE</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-sans mt-4 max-w-md relative z-10">
            This live score aggregates your carbon ledger inputs. Calculated variables align dynamically with authenticated greenhouse metrics.
          </p>
        </div>

        {/* Goal Progress Card */}
        <div className="lg:col-span-5 p-8 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 shadow-sm dark:shadow-none">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#A2E000] dark:text-[#C4FF00] font-mono font-black">Environmental Target</span>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-550 dark:text-zinc-400 font-bold">Ledger Verified</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-serif italic text-zinc-900 dark:text-white font-semibold">{goal.targetPercentage}% Reduction Goal</span>
                <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-900/5 dark:bg-white/5 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-white/10" aria-live="polite">
                  {progressPercentage}% Achieved
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-1" aria-label="Goal progress map">
                <div 
                  className="bg-[#C4FF00] dark:bg-[#C4FF00] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(196,255,0,0.3)]" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              const updated = prompt("Set new CO2 reduction goal (1-100%):", goal.targetPercentage.toString());
              if (updated && !isNaN(Number(updated))) {
                onUpdateGoal(Math.max(1, Math.min(100, Number(updated))));
              }
            }}
            className="w-full mt-4 py-2.5 bg-zinc-900/5 dark:bg-white/5 hover:bg-[#C4FF00] hover:dark:bg-[#C4FF00] text-zinc-700 dark:text-zinc-200 hover:text-black hover:dark:text-black border border-zinc-200/80 dark:border-white/10 hover:border-transparent rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C4FF00]"
            aria-label="Adjust current carbon reduction target percentage"
          >
            Adjust Target
          </button>
        </div>
      </div>

      {/* Primary Dynamic Metrics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm dark:shadow-none"
          id="stat-card-total-footprint"
        >
          <div>
            <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Projected Annual Weight</span>
              <Leaf className="w-4 h-4 text-[#A2E000] dark:text-[#C4FF00]" />
            </div>
            <h3 className="text-3xl font-mono text-zinc-900 dark:text-white mt-3 font-bold">
              {totalAnnualFootprint.toLocaleString()}
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">kg CO2e / Year aggregate</span>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-200/85 dark:border-zinc-800/80 pt-3">
            Target annual sum based on active calculator criteria & user log adjustments.
          </div>
        </div>

        <div 
          className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm dark:shadow-none"
          id="stat-card-weekly-savings"
        >
          <div>
            <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Active Weekly Offset</span>
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-[#C4FF00]" />
            </div>
            <h3 className="text-3xl font-mono text-emerald-600 dark:text-[#C4FF00] mt-3 font-bold">
              -{activeWeeklySavings.toFixed(1)}
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">kg CO2e / Week reduction rate</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-[#C4FF00] bg-emerald-500/10 dark:bg-[#C4FF00]/5 border border-emerald-500/20 dark:border-[#C4FF00]/15 p-2.5 rounded-lg leading-relaxed">
            🌿 Compounding dynamic savings of <strong className="font-mono font-bold">{(activeWeeklySavings * 52).toFixed(0)} kg CO2e</strong> per year is forecasted.
          </div>
        </div>

        <div 
          className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm dark:shadow-none"
          id="stat-card-climate-grade"
        >
          <div>
            <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Active Safety Grade</span>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#C4FF00]" />
            </div>
            <div className="flex items-baseline gap-3 mt-3">
              <h3 className="text-4xl font-serif italic text-zinc-900 dark:text-white font-black">
                {aiReport?.grade || (totalAnnualFootprint < 3000 ? "A" : totalAnnualFootprint < 5000 ? "B" : totalAnnualFootprint < 8000 ? "C" : "D")}
              </h3>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-900 dark:text-[#C4FF00] bg-[#C4FF00]/20 dark:bg-[#C4FF00]/10 border border-[#C4FF00]/30 dark:border-[#C4FF00]/20 px-2 py-0.5 rounded">
                {totalAnnualFootprint < 4000 ? "Eco Guardian" : "Active Learner"}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-200/85 dark:border-zinc-800/80 pt-3">
            Average global carbon footprint per person is ~4,800 kg/year. Lower values reflect safer ecological targets.
          </p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-layout-section">
        {/* Footprint Category Breakdown Chart */}
        <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-2xl lg:col-span-8 flex flex-col justify-between shadow-sm dark:shadow-none transition-all duration-300">
          <div>
            <h3 className="text-base font-serif italic text-zinc-900 dark:text-white tracking-wide mb-1 font-semibold">
              Global Source Breakdown Categories
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono uppercase mb-6 tracking-wider">Historical distribution analysis</p>
          </div>
          <div className="h-72 w-full" id="responsive-recharts-container">
            {totalAnnualFootprint === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-white/40 border border-dashed border-zinc-200 dark:border-white/10 rounded-xl p-5 bg-zinc-900/[0.01] dark:bg-white/[0.01]">
                <Leaf className="w-10 h-10 mb-2 stroke-1 text-[#A2E000] dark:text-[#C4FF00] opacity-65" />
                <p className="text-xs">No active carbon entries measured. Complete the carbon calculator to generate metric models.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTotals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(125, 125, 125, 0.15)" />
                  <XAxis dataKey="name" stroke="rgba(115, 115, 115, 0.6)" fontSize={10} tickLine={false} fontClassName="font-mono" />
                  <YAxis unit="kg" stroke="rgba(115, 115, 115, 0.6)" fontSize={10} tickLine={false} fontClassName="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(15, 15, 15, 0.9)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid rgba(125, 125, 125, 0.2)", color: "#fff" }} 
                    formatter={(val) => [`${val} kg CO2e`, "Annual footprint"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Tips or AI mini coach box */}
        <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-2xl lg:col-span-4 flex flex-col justify-between space-y-6 shadow-sm dark:shadow-none transition-all duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-serif italic text-zinc-900 dark:text-white tracking-wide font-semibold">
                  Active Audit Report
                </h3>
                <p className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-bold">Environmental advice matrix</p>
              </div>
              <button
                onClick={onTriggerAiCoach}
                disabled={loadingCoach}
                className="text-[10px] font-mono tracking-wider uppercase font-bold text-zinc-900 dark:text-black bg-zinc-900/5 dark:bg-[#C4FF00] hover:bg-[#C4FF00] hover:text-black dark:hover:bg-white dark:hover:text-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm border border-zinc-200 dark:border-transparent font-bold"
              >
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-black" />
                {loadingCoach ? "Analyzing..." : "Diagnose"}
              </button>
            </div>

            {aiReport ? (
              <div className="space-y-4" id="ai-coach-report-display">
                <div className="bg-zinc-900/5 dark:bg-white/5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                  <p className="text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed italic">
                    "{aiReport.summary}"
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 font-mono font-bold">
                    AI Curated Priorities
                  </h4>
                  <ul className="space-y-3">
                    {aiReport.customTips?.slice(0, 2).map((tip: any, index: number) => (
                      <li key={index} className="flex gap-2.5 items-start text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 pb-2.5 last:border-0 last:pb-0">
                        <div className="w-5 h-5 flex items-center justify-center rounded-md bg-[#C4FF00]/10 border border-[#C4FF00]/25 text-[#A2E000] dark:text-[#C4FF00] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <strong className="text-zinc-900 dark:text-white block font-medium">{tip.title}</strong>
                          <span className="text-zinc-500 dark:text-zinc-400 block text-[11px] leading-snug">{tip.description}</span>
                          <span className="font-mono text-[9px] text-[#A2E000] dark:text-[#C4FF00] font-bold block bg-[#C4FF00]/10 dark:bg-[#C4FF00]/5 px-2 py-0.5 rounded border border-[#C4FF00]/15 dark:border-[#C4FF00]/10 w-fit mt-1">
                            Est. Saving: -{tip.potentialSavingsKg} kg/wk
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 dark:text-white/40 bg-zinc-900/[0.02] dark:bg-white/[0.02] rounded-xl border border-zinc-200 dark:border-white/5 p-4" id="ai-report-empty">
                <Sparkles className="w-8 h-8 text-[#A2E000] dark:text-[#C4FF00]/40 mx-auto stroke-1 mb-2" />
                <p className="text-xs leading-relaxed px-2 text-zinc-650 dark:text-white/60">
                  Trigger an AI diagnostics report to receive fully personalized climate guidance, calculated annual scopes, and bespoke saving priorities.
                </p>
                <button
                  onClick={onTriggerAiCoach}
                  disabled={loadingCoach}
                  className="mt-4 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-black bg-zinc-900/5 dark:bg-[#C4FF00] hover:bg-[#C4FF00] hover:text-black dark:hover:bg-white dark:hover:text-black rounded-lg transition-colors cursor-pointer border border-zinc-200 dark:border-transparent"
                >
                  {loadingCoach ? "Analyzing Profiles..." : "Get AI Report"}
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] text-zinc-500 dark:text-white/45 border-t border-zinc-200 dark:border-white/5 pt-3 flex items-center justify-between font-mono">
            <span>Projected Annual Scope:</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {aiReport?.annualProjectedEmissions ? `${aiReport.annualProjectedEmissions} kg` : "Pending audit"}
            </span>
          </div>
        </div>
      </div>

      {/* Ledger History Listing */}
      <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm dark:shadow-none transition-all duration-300" id="ledger-history-listing">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-serif italic text-zinc-900 dark:text-white tracking-wide font-semibold">
              Carbon Footprint ledger
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono uppercase tracking-wider">
              Active parameters generating your core greenhouse budget.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-900/5 dark:bg-white/5 hover:bg-zinc-900/10 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00]"
              aria-expanded={showAddManual}
            >
              <Plus className="w-3.5 h-3.5 text-[#A2E000] dark:text-[#C4FF00]" />
              Modify Ledger
            </button>
          </div>
        </div>

        {/* Adjustments Form Drawer */}
        {showAddManual && (
          <form onSubmit={handleManualSubmit} className="bg-zinc-100/50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6 max-w-xl space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-mono font-black text-[#A2E000] dark:text-[#C4FF00]">Add Footprint Modification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="manual-label-input" className="block text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono font-bold mb-1.5">Item Label / Activity</label>
                <input 
                  id="manual-label-input"
                  type="text" 
                  value={manualName} 
                  onChange={(e) => setManualName(e.target.value)} 
                  placeholder="e.g. Flight to Tokyo"
                  className="w-full bg-white dark:bg-[#050505] border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C4FF00] focus:ring-1 focus:ring-[#C4FF00]"
                  required
                />
              </div>
              <div>
                <label htmlFor="manual-footprint-input" className="block text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono font-bold mb-1.5">Carbon (kg CO2e)</label>
                <input 
                  id="manual-footprint-input"
                  type="number" 
                  value={manualCo2} 
                  onChange={(e) => setManualCo2(e.target.value)} 
                  placeholder="e.g. 125.4"
                  className="w-full bg-white dark:bg-[#050505] border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C4FF00] focus:ring-1 focus:ring-[#C4FF00]"
                  required
                />
              </div>
              <div>
                <label htmlFor="manual-category-select" className="block text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono font-bold mb-1.5">Source Category</label>
                <select
                  id="manual-category-select"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as CarbonCategory)}
                  className="w-full bg-white dark:bg-[#050505] border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C4FF00] focus:ring-1 focus:ring-[#C4FF00]"
                >
                  <option value="transport">Transport (Commutes, Flights)</option>
                  <option value="energy">Energy & utilities</option>
                  <option value="diet">Diet & Nutrition</option>
                  <option value="lifestyle">Lifestyle & Shopping</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2 font-mono">
              <button 
                type="button" 
                onClick={() => setShowAddManual(false)} 
                className="px-3.5 py-1.5 bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent rounded-lg cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-[#C4FF00] hover:bg-zinc-800 hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-extrabold uppercase rounded-lg cursor-pointer transition-colors focus:outline-none"
              >
                Insert Entry
              </button>
            </div>
          </form>
        )}

        {/* Ledger table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-black/40">
          <table className="w-full text-left border-collapse" id="ledger-history-table">
            <thead>
              <tr className="bg-zinc-200/50 dark:bg-white/5 text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono border-b border-zinc-200 dark:border-zinc-800">
                <th scope="col" className="px-5 py-3">Category</th>
                <th scope="col" className="px-5 py-3">Log Entry Detail</th>
                <th scope="col" className="px-5 py-3">Emissions Impact (kg CO2e/yr)</th>
                <th scope="col" className="px-5 py-3">Logged Date</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                    Your footprint ledger is currently blank. Standardize parameters using the calculator tab.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isOffset = log.isOffset;
                  return (
                    <tr key={log.id} className="border-b border-zinc-200 dark:border-zinc-900 hover:bg-zinc-900/[0.02] dark:hover:bg-white/[0.02] transition-colors text-xs text-zinc-750 dark:text-zinc-300">
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase ${
                          log.category === "transport" ? "bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20" :
                          log.category === "energy" ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20" :
                          log.category === "diet" ? "bg-rose-500/10 text-rose-605 dark:text-rose-400 border border-rose-500/20" :
                          "bg-[#C4FF00]/10 text-emerald-700 dark:text-[#C4FF00] border border-[#C4FF00]/30"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.category === "transport" ? "bg-amber-500" :
                            log.category === "energy" ? "bg-sky-500" :
                            log.category === "diet" ? "bg-rose-500" :
                            "bg-emerald-600 dark:bg-[#C4FF00]"
                          }`} />
                          {log.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-white">
                        {log.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span className={isOffset ? "text-emerald-600 dark:text-[#C4FF00]" : "text-zinc-900 dark:text-white font-semibold"}>
                          {isOffset ? "-" : ""}{log.value.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
                        {new Date(log.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          aria-label={`Delete ledger item ${log.name}`}
                          className="text-zinc-400 dark:text-zinc-500 hover:text-red-550 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
