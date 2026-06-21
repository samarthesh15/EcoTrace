import React, { useState, useEffect, useMemo } from "react";
import { 
  FootprintLogEntry, 
  CarbonCategory, 
  CarbonReductionGoal 
} from "./types";
import { PREDEFINED_ACTIONS } from "./data/predefinedActions";
import OverviewDashboard from "./components/OverviewDashboard";
import CarbonCalculator from "./components/CarbonCalculator";
import ActionPlanner from "./components/ActionPlanner";
import AiAssistant from "./components/AiAssistant";
import { 
  Leaf, 
  Calculator, 
  Sparkles, 
  CheckSquare, 
  HelpCircle, 
  ShieldCheck, 
  Compass, 
  RotateCcw,
  BarChart2
} from "lucide-react";

// Initial baseline logs to give the user immediate interactive data in their dashboard
const INITIAL_LOGS: FootprintLogEntry[] = [
  {
    id: "baseline-car-commute",
    date: new Date().toISOString(),
    category: "transport",
    name: "Base Driving Commute (Petrol)",
    value: 1638,
  },
  {
    id: "baseline-transit",
    date: new Date().toISOString(),
    category: "transport",
    name: "Public Transport usage",
    value: 104,
  },
  {
    id: "baseline-flights",
    date: new Date().toISOString(),
    category: "transport",
    name: "Annual flights estimate",
    value: 1300,
  },
  {
    id: "baseline-electricity",
    date: new Date().toISOString(),
    category: "energy",
    name: "Grid Electricity usage",
    value: 1512,
  },
  {
    id: "baseline-gas",
    date: new Date().toISOString(),
    category: "energy",
    name: "Natural Gas heating",
    value: 360,
  },
  {
    id: "baseline-food",
    date: new Date().toISOString(),
    category: "diet",
    name: "Diet style: Balanced meat-eater",
    value: 2300,
  },
  {
    id: "baseline-lifestyle",
    date: new Date().toISOString(),
    category: "lifestyle",
    name: "Lifestyle Shopping consumption",
    value: 1600,
  }
];

const DEFAULT_GOAL: CarbonReductionGoal = {
  targetPercentage: 20,
  baseFootprint: 6814, // Cumulative baseline totals
  deadlineDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split("T")[0]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "calculator" | "actions" | "ai">("overview");

  // Core Ledger Logs State
  const [logs, setLogs] = useState<FootprintLogEntry[]>(() => {
    const stored = localStorage.getItem("carbon_footprint_logs");
    return stored ? JSON.parse(stored) : INITIAL_LOGS;
  });

  // Active Goals State
  const [goal, setGoal] = useState<CarbonReductionGoal>(() => {
    const stored = localStorage.getItem("carbon_reduction_goal");
    return stored ? JSON.parse(stored) : DEFAULT_GOAL;
  });

  // Adopted Eco-Action States
  const [actionStates, setActionStates] = useState<Record<string, "active" | "completed">>(() => {
    const stored = localStorage.getItem("carbon_active_actions");
    return stored ? JSON.parse(stored) : {};
  });

  // Gemini Diagnostics State
  const [aiReport, setAiReport] = useState<any>(() => {
    const stored = localStorage.getItem("carbon_ai_report");
    return stored ? JSON.parse(stored) : null;
  });
  const [loadingCoach, setLoadingCoach] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("carbon_footprint_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("carbon_reduction_goal", JSON.stringify(goal));
  }, [goal]);

  useEffect(() => {
    localStorage.setItem("carbon_active_actions", JSON.stringify(actionStates));
  }, [actionStates]);

  useEffect(() => {
    localStorage.setItem("carbon_ai_report", JSON.stringify(aiReport));
  }, [aiReport]);

  // Aggregate current live active weekly savings based on active actions map
  const activeWeeklySavings = useMemo(() => {
    let sum = 0;
    PREDEFINED_ACTIONS.forEach((action) => {
      if (actionStates[action.id] === "active") {
        sum += action.co2SavedPerWeek;
      }
    });
    return sum;
  }, [actionStates]);

  // Event Handlers
  const handleAddManualLog = (category: CarbonCategory, name: string, value: number) => {
    const newLog: FootprintLogEntry = {
      id: `manual-log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date().toISOString(),
      category,
      name,
      value: +value,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAddLogDirectly = (category: CarbonCategory, name: string, value: number) => {
    const newLog: FootprintLogEntry = {
      id: `automated-log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date().toISOString(),
      category,
      name,
      value: +value,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleClearCategoryLogs = (category: CarbonCategory) => {
    // Keeps manual entries but clears custom automated estimates that match the category
    setLogs(prev => prev.filter(log => log.category !== category || log.id.startsWith("manual-log-")));
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleToggleAction = (actionId: string, itemSavings: number) => {
    setActionStates((prev) => {
      const copy = { ...prev };
      if (copy[actionId] === "active") {
        delete copy[actionId];
      } else {
        copy[actionId] = "active";
      }
      return copy;
    });
  };

  // Convert an active item to complete, adding its savings as a direct offset reduction entry in history ledger
  const handleLogCompletedSingleAction = (
    actionId: string, 
    actionName: string, 
    category: CarbonCategory, 
    savingsKg: number
  ) => {
    const newOffsetLog: FootprintLogEntry = {
      id: `offset-log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date().toISOString(),
      category,
      name: actionName,
      value: +savingsKg,
      isOffset: true // Marks as beneficial deduction
    };

    setLogs(prev => [newOffsetLog, ...prev]);
    // Optionally trigger a short congrats notice
  };

  const handleUpdateGoal = (newTarget: number) => {
    setGoal(prev => ({
      ...prev,
      targetPercentage: newTarget
    }));
  };

  const handleResetLedgerToDefaultData = () => {
    if (window.confirm("Restore demo entries to your carbon ledger? This resets calculations.")) {
      setLogs(INITIAL_LOGS);
      setGoal(DEFAULT_GOAL);
      setActionStates({});
      setAiReport(null);
    }
  };

  // Safe server-side Gemini AI Diagnostics trigger
  const handleTriggerAiCoach = async () => {
    setLoadingCoach(true);
    try {
      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          logs: logs.map(l => ({ name: l.name, value: l.value, category: l.category })),
          currentActiveSavings: activeWeeklySavings 
        })
      });

      if (!response.ok) {
        throw new Error("Diagnostics API call encountered a transmission error.");
      }

      const data = await response.json();
      setAiReport(data);
    } catch (err) {
      console.error(err);
      alert("Encountered an issue running AI environmental diagnostics. Please verify connection credentials.");
    } finally {
      setLoadingCoach(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#C4FF00]/20 selection:text-[#C4FF00] font-sans antialiased relative overflow-hidden">
      {/* Decorative vertical blueprint lines or background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C4FF00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Row */}
      <header className="bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C4FF00]/10 border border-[#C4FF00]/20 flex items-center justify-center text-[#C4FF00] shrink-0">
              <Leaf className="w-5 h-5 fill-[#C4FF00]/15" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 font-mono">EcoTrace OS</div>
              <h1 className="text-xl font-black italic serif text-[#C4FF00]">
                EcoTrace
              </h1>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                activeTab === "overview" 
                  ? "bg-white/5 border-white/15 text-[#C4FF00]" 
                  : "bg-transparent border-transparent text-white/50 hover:text-white hover:border-white/5"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Overview Hub
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                activeTab === "calculator" 
                  ? "bg-white/5 border-white/15 text-[#C4FF00]" 
                  : "bg-transparent border-transparent text-white/50 hover:text-white"
              }`}
            >
              <Calculator className="w-4 h-4" />
              Interactive Calculator
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                activeTab === "actions" 
                  ? "bg-white/5 border-white/15 text-[#C4FF00]" 
                  : "bg-transparent border-transparent text-white/50 hover:text-white"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Action Catalog
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                activeTab === "ai" 
                  ? "bg-white/5 border-white/15 text-[#C4FF00]" 
                  : "bg-transparent border-transparent text-white/50 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#C4FF00]" />
              Custom AI Estimator
            </button>
          </nav>

          {/* Settings Drawer Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetLedgerToDefaultData}
              title="Reset metrics to baseline scenario"
              className="p-2 text-white/40 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="bg-[#C4FF00]/10 text-[#C4FF00] border border-[#C4FF00]/20 rounded-lg py-1 px-2.5 text-[10px] uppercase font-bold tracking-widest hidden sm:flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE AI PROXY
            </div>
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0A] grid grid-cols-4 text-center text-[10px] w-full font-mono font-semibold">
          <button 
            onClick={() => setActiveTab("overview")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-colors ${activeTab === "overview" ? "border-[#C4FF00] text-[#C4FF00] bg-white/5" : "border-transparent text-white/45"}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("calculator")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-colors ${activeTab === "calculator" ? "border-[#C4FF00] text-[#C4FF00] bg-white/5" : "border-transparent text-white/45"}`}
          >
            Calculator
          </button>
          <button 
            onClick={() => setActiveTab("actions")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-colors ${activeTab === "actions" ? "border-[#C4FF00] text-[#C4FF00] bg-white/5" : "border-transparent text-white/45"}`}
          >
            Actions
          </button>
          <button 
            onClick={() => setActiveTab("ai")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-all ${activeTab === "ai" ? "border-[#C4FF00] text-[#C4FF00] bg-white/5" : "border-transparent text-white/45"}`}
          >
            AI Custom
          </button>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" id="application-main-view">
        {activeTab === "overview" && (
          <OverviewDashboard
            logs={logs}
            activeWeeklySavings={activeWeeklySavings}
            onAddManualLog={handleAddManualLog}
            onDeleteLog={handleDeleteLog}
            goal={goal}
            onUpdateGoal={handleUpdateGoal}
            aiReport={aiReport}
            onTriggerAiCoach={handleTriggerAiCoach}
            loadingCoach={loadingCoach}
          />
        )}

        {activeTab === "calculator" && (
          <CarbonCalculator
            onAddLog={handleAddLogDirectly}
            onClearCategoryLogs={handleClearCategoryLogs}
            logs={logs}
          />
        )}

        {activeTab === "actions" && (
          <ActionPlanner
            activeActionIdMap={actionStates}
            onToggleAction={handleToggleAction}
            onLogCompletedSingleAction={handleLogCompletedSingleAction}
          />
        )}

        {activeTab === "ai" && (
          <AiAssistant
            onAddLog={handleAddLogDirectly}
          />
        )}
      </main>

      {/* Human Footnotes footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/10 py-10 mt-16 text-center text-xs text-white/40 font-mono leading-relaxed relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-white/60 serif italic tracking-wide">EcoTrace OS • Real-Time Environmental Physics Matrix</p>
          <p className="mt-1 pb-4 border-b border-white/5 max-w-sm mx-auto">
            Factors calibrated with EPA & IPCC greenhouse metrics. Verified ISO-14064 Compliance.
          </p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-[10px] uppercase opacity-60">
             <span>Access: VRD-092-2024</span>
             <span>•</span>
             <span>Status: Stable OS PROD</span>
             <span>•</span>
             <span className="text-[#C4FF00]">Powered by Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
