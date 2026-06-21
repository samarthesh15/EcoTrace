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
      {/* Premium Bento Grid: Separates the Metric Metric Tons display from Goal Controls to prevent crowding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Impact Card */}
        <div className="lg:col-span-7 p-8 bg-[#0A0A0A] border border-zinc-800 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4FF00]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold block">Yearly Impact Coefficient</span>
            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <span className="text-5xl sm:text-7xl font-sans font-black text-white tracking-tight leading-none">
                {footprintInTons}
              </span>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-serif italic text-[#C4FF00] font-semibold">Metric Tons</span>
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">CO2e / ACCOUNT PROFILE</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans mt-4 max-w-md relative z-10">
            This live score aggregates your carbon ledger inputs. Calculated variables align dynamically with authenticated greenhouse metrics.
          </p>
        </div>

        {/* Goal Progress Card */}
        <div className="lg:col-span-5 p-8 bg-[#0A0A0A] border border-zinc-800 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#C4FF00] font-mono font-black">Environmental Target</span>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400">Ledger Verified</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-serif italic text-white font-medium">{goal.targetPercentage}% Reduction Goal</span>
                <span className="text-[11px] font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded" aria-live="polite">
                  {progressPercentage}% Achieved
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1" aria-label="Goal progress map">
                <div 
                  className="bg-[#C4FF00] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(196,255,0,0.3)]" 
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
            className="w-full mt-4 py-2 bg-white/5 hover:bg-[#C4FF00] text-zinc-200 hover:text-black border border-white/10 hover:border-transparent rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00] focus-visible:ring-[#C4FF00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Adjust current carbon reduction target percentage"
          >
            Adjust Target
          </button>
        </div>
      </div>

      {/* Primary Dynamic Metrics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4"
          id="stat-card-total-footprint"
        >
          <div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Projected Annual Weight</span>
              <Leaf className="w-4 h-4 text-[#C4FF00]" />
            </div>
            <h3 className="text-3xl font-mono text-white mt-3 font-semibold">
              {totalAnnualFootprint.toLocaleString()}
            </h3>
            <span className="text-xs text-zinc-400 font-mono">kg CO2e / Year aggregate</span>
          </div>
          <div className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800 pt-3">
            Target annual sum based on active calculator criteria & user log adjustments.
          </div>
        </div>

        <div 
          className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4"
          id="stat-card-weekly-savings"
        >
          <div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Active Weekly Offset</span>
              <TrendingDown className="w-4 h-4 text-[#C4FF00]" />
            </div>
            <h3 className="text-3xl font-mono text-[#C4FF00] mt-3 font-semibold">
              -{activeWeeklySavings.toFixed(1)}
            </h3>
            <span className="text-xs text-zinc-400 font-mono">kg CO2e / Week reduction rate</span>
          </div>
          <div className="text-[11px] text-[#C4FF00] bg-[#C4FF00]/5 border border-[#C4FF00]/15 p-2.5 rounded-lg leading-relaxed">
            🌿 Compounding dynamic savings of <strong className="font-mono font-bold">{(activeWeeklySavings * 52).toFixed(0)} kg CO2e</strong> per year is forecasted.
          </div>
        </div>

        <div 
          className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4"
          id="stat-card-climate-grade"
        >
          <div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Active Safety Grade</span>
              <Sparkles className="w-4 h-4 text-[#C4FF00]" />
            </div>
            <div className="flex items-baseline gap-3 mt-3">
              <h3 className="text-4xl font-serif italic text-white font-black">
                {aiReport?.grade || (totalAnnualFootprint < 3000 ? "A" : totalAnnualFootprint < 5000 ? "B" : totalAnnualFootprint < 8000 ? "C" : "D")}
              </h3>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#C4FF00] bg-[#C4FF00]/10 border border-[#C4FF00]/20 px-2 py-0.5 rounded">
                {totalAnnualFootprint < 4000 ? "Eco Guardian" : "Active Learner"}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800 pt-3">
            Average global carbon footprint per person is ~4,800 kg/year. Lower values reflect safer ecological targets.
          </p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-layout-section">
        {/* Footprint Category Breakdown Chart */}
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-800 lg:col-span-8 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-serif italic text-white tracking-wide mb-1 font-semibold">
              Global Source Breakdown Categories
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono uppercase mb-6 tracking-wider">Historical distribution analysis</p>
          </div>
          <div className="h-72 w-full" id="responsive-recharts-container">
            {totalAnnualFootprint === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 border border-dashed border-white/10 rounded-xl p-5 bg-white/[0.01]">
                <Leaf className="w-10 h-10 mb-2 stroke-1 text-[#C4FF00] opacity-60" />
                <p className="text-xs">No active carbon entries measured. Complete the carbon calculator to generate metric models.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTotals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.4)" fontSize={10} tickLine={false} fontClassName="font-mono" />
                  <YAxis unit="kg" stroke="rgba(255, 255, 255, 0.4)" fontSize={10} tickLine={false} fontClassName="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0A0A0A", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff" }} 
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
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-800 lg:col-span-4 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-serif italic text-white tracking-wide font-semibold">
                  Active Audit Report
                </h3>
                <p className="text-[9px] font-mono text-zinc-400 uppercase font-bold">Environmental advice matrix</p>
              </div>
              <button
                onClick={onTriggerAiCoach}
                disabled={loadingCoach}
                className="text-[10px] font-mono tracking-wider uppercase font-bold text-black bg-[#C4FF00] hover:bg-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-black" />
                {loadingCoach ? "Analyzing..." : "Diagnose"}
              </button>
            </div>

            {aiReport ? (
              <div className="space-y-4" id="ai-coach-report-display">
                <div className="bg-white/5 p-3.5 rounded-xl border border-zinc-850">
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{aiReport.summary}"
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 font-mono font-bold">
                    AI Curated Priorities
                  </h4>
                  <ul className="space-y-3">
                    {aiReport.customTips?.slice(0, 2).map((tip: any, index: number) => (
                      <li key={index} className="flex gap-2.5 items-start text-zinc-300 border-b border-zinc-850 pb-2.5 last:border-0 last:pb-0">
                        <div className="w-5 h-5 flex items-center justify-center rounded-md bg-[#C4FF00]/10 border border-[#C4FF00]/20 text-[#C4FF00] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <strong className="text-white block font-medium">{tip.title}</strong>
                          <span className="text-white/50 block text-[11px] leading-snug">{tip.description}</span>
                          <span className="font-mono text-[9px] text-[#C4FF00] font-bold block bg-[#C4FF00]/5 px-2 py-0.5 rounded border border-[#C4FF00]/10 w-fit mt-1">
                            Est. Saving: -{tip.potentialSavingsKg} kg/wk
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-white/40 bg-white/[0.02] rounded-xl border border-white/5 p-4" id="ai-report-empty">
                <Sparkles className="w-8 h-8 text-[#C4FF00]/40 mx-auto stroke-1 mb-2" />
                <p className="text-xs leading-relaxed px-2 text-white/60">
                  Trigger an AI diagnostics report to receive fully personalized climate guidance, calculated annual scopes, and bespoke saving priorities.
                </p>
                <button
                  onClick={onTriggerAiCoach}
                  disabled={loadingCoach}
                  className="mt-4 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-black bg-[#C4FF00] hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  {loadingCoach ? "Analyzing Profiles..." : "Get AI Report"}
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] text-white/45 border-t border-white/5 pt-3 flex items-center justify-between font-mono">
            <span>Projected Annual Scope:</span>
            <span className="font-bold text-white">
              {aiReport?.annualProjectedEmissions ? `${aiReport.annualProjectedEmissions} kg` : "Pending audit"}
            </span>
          </div>
        </div>
      </div>

      {/* Ledger History Listing */}
      <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-800" id="ledger-history-listing">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-serif italic text-white tracking-wide font-semibold">
              Carbon Footprint ledger
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-mono uppercase tracking-wider">
              Active parameters generating your core greenhouse budget.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
              aria-expanded={showAddManual}
            >
              <Plus className="w-3.5 h-3.5 text-[#C4FF00]" />
              Modify Ledger
            </button>
          </div>
        </div>

        {/* Adjustments Form Drawer */}
        {showAddManual && (
          <form onSubmit={handleManualSubmit} className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-850 mb-6 max-w-xl space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-[#C4FF00]">Add Footprint Modification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="manual-label-input" className="block text-[10px] text-zinc-400 uppercase font-mono font-bold mb-1.5">Item Label / Activity</label>
                <input 
                  id="manual-label-input"
                  type="text" 
                  value={manualName} 
                  onChange={(e) => setManualName(e.target.value)} 
                  placeholder="e.g. Flight to Tokyo"
                  className="w-full bg-[#050505] border border-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C4FF00] focus:ring-1 focus:ring-[#C4FF00]"
                  required
                />
              </div>
              <div>
                <label htmlFor="manual-footprint-input" className="block text-[10px] text-zinc-400 uppercase font-mono font-bold mb-1.5">Carbon (kg CO2e)</label>
                <input 
                  id="manual-footprint-input"
                  type="number" 
                  value={manualCo2} 
                  onChange={(e) => setManualCo2(e.target.value)} 
                  placeholder="e.g. 125.4"
                  className="w-full bg-[#050505] border border-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C4FF00] focus:ring-1 focus:ring-[#C4FF00]"
                  required
                />
              </div>
              <div>
                <label htmlFor="manual-category-select" className="block text-[10px] text-zinc-400 uppercase font-mono font-bold mb-1.5">Source Category</label>
                <select
                  id="manual-category-select"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as CarbonCategory)}
                  className="w-full bg-[#050505] border border-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C4FF00] focus:ring-1 focus:ring-[#C4FF00]"
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
                className="px-3.5 py-1.5 bg-transparent text-zinc-400 hover:text-white border border-transparent rounded-lg cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-[#C4FF00] hover:bg-white text-black font-bold uppercase rounded-lg cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Insert Entry
              </button>
            </div>
          </form>
        )}

        {/* Ledger table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-black/40">
          <table className="w-full text-left border-collapse" id="ledger-history-table">
            <thead>
              <tr className="bg-white/5 text-[9px] text-zinc-400 uppercase tracking-widest font-mono border-b border-zinc-800">
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
                  <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs font-mono">
                    Your footprint ledger is currently blank. Standardize parameters using the calculator tab.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isOffset = log.isOffset;
                  return (
                    <tr key={log.id} className="border-b border-zinc-900 hover:bg-white/[0.02] transition-colors text-xs text-zinc-300">
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase ${
                          log.category === "transport" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                          log.category === "energy" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                          log.category === "diet" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          "bg-[#C4FF00]/10 text-[#C4FF00] border border-[#C4FF00]/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.category === "transport" ? "bg-amber-400" :
                            log.category === "energy" ? "bg-sky-400" :
                            log.category === "diet" ? "bg-rose-400" :
                            "bg-[#C4FF00]"
                          }`} />
                          {log.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-white">
                        {log.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span className={isOffset ? "text-[#C4FF00]" : "text-white"}>
                          {isOffset ? "-" : ""}{log.value.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400 font-mono text-[10px]">
                        {new Date(log.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          aria-label={`Delete ledger item ${log.name}`}
                          className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00]"
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
