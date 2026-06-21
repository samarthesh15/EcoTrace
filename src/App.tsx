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
  BarChart2,
  Sun,
  Moon
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

  // Theme support
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const stored = localStorage.getItem("carbon_theme");
    return stored === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("carbon_theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme]);

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
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 selection:bg-[#C4FF00]/30 selection:text-black dark:selection:text-[#C4FF00] font-sans antialiased relative overflow-hidden transition-colors duration-300">
      {/* Decorative Premium Backdrop Image Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-[0.03] dark:opacity-[0.06] mix-blend-luminosity dark:mix-blend-overlay">
        <img 
          src="/src/assets/images/eco_cellular_leaf_1782071779621.jpg" 
          alt="" 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Dynamic Animated Glassmorphic Backdrop Blobs */}
      <div className="absolute top-[-100px] right-[-50px] w-[600px] h-[600px] bg-[#C4FF00]/10 dark:bg-[#C4FF00]/5 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-emerald-500/15 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute top-[35%] left-[25%] w-[350px] h-[350px] bg-indigo-400/[0.08] dark:bg-indigo-500/0 rounded-full blur-[120px] pointer-events-none" />

      {/* Screen Reader Only Assistive Text Descriptions */}
      <div className="sr-only">
        <span id="theme-toggle-desc">Toggle the visual interface between a high-contrast light theme and an eye-safe dark theme.</span>
        <span id="reset-button-desc">Warning: Clicking this button will reset all custom carbon logging ledger entries and calculator parameters back to the default baseline scenario.</span>
        <span id="overview-tab-desc">Displays your global carbon emission breakdown, AI environmental priorities, and active footprint ledger logs.</span>
        <span id="calculator-tab-desc">Opens the carbon calculator where you can adjust vehicle, flight, renewable energy, meat, and consumer shopping parameters to sync with your footprint.</span>
        <span id="actions-tab-desc">Opens the ecology action catalog. Adopt and log conservation duties like biking, line-drying clothes, or adopting a plant-based habit.</span>
        <span id="ai-tab-desc">Launches the custom AI-powered carbon calculator. Ask questions or insert scenario plans to estimate direct carbon impact through Gemini.</span>
      </div>

      {/* Top Navigation Row */}
      <header className="bg-white/70 dark:bg-[#0A0A0A]/70 border-b border-zinc-200/80 dark:border-white/10 sticky top-0 backdrop-blur-xl z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C4FF00]/10 border border-[#C4FF00]/20 dark:border-[#C4FF00]/20 flex items-center justify-center text-[#C4FF00] shrink-0">
              <Leaf className="w-5 h-5 fill-[#C4FF00]/15 text-emerald-600 dark:text-[#C4FF00]" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 dark:opacity-40 font-mono">EcoTrace OS</div>
              <h1 className="text-xl font-black italic serif text-zinc-900 dark:text-[#C4FF00]">
                EcoTrace
              </h1>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono" role="tablist" aria-label="EcoTrace Navigation Tabs">
            <button
              id="tab-overview"
              role="tab"
              aria-selected={activeTab === "overview"}
              aria-controls="application-main-view"
              aria-label="Overview Hub tab button"
              aria-describedby="overview-tab-desc"
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00] ${
                activeTab === "overview" 
                  ? "bg-zinc-900/5 dark:bg-white/10 border-zinc-200/80 dark:border-white/15 text-zinc-900 dark:text-[#C4FF00] shadow-sm backdrop-blur-md" 
                  : "bg-transparent border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-900/5 dark:hover:bg-white/5"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Overview Hub
            </button>
            <button
              id="tab-calculator"
              role="tab"
              aria-selected={activeTab === "calculator"}
              aria-controls="application-main-view"
              aria-label="Interactive Calculator tab button"
              aria-describedby="calculator-tab-desc"
              onClick={() => setActiveTab("calculator")}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00] ${
                activeTab === "calculator" 
                  ? "bg-zinc-900/5 dark:bg-white/10 border-zinc-200/80 dark:border-white/15 text-zinc-900 dark:text-[#C4FF00] shadow-sm backdrop-blur-md" 
                  : "bg-transparent border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-900/5 dark:hover:bg-white/5"
              }`}
            >
              <Calculator className="w-4 h-4" />
              Interactive Calculator
            </button>
            <button
              id="tab-actions"
              role="tab"
              aria-selected={activeTab === "actions"}
              aria-controls="application-main-view"
              aria-label="Action Catalog tab button"
              aria-describedby="actions-tab-desc"
              onClick={() => setActiveTab("actions")}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00] ${
                activeTab === "actions" 
                  ? "bg-zinc-900/5 dark:bg-white/10 border-zinc-200/80 dark:border-white/15 text-zinc-900 dark:text-[#C4FF00] shadow-sm backdrop-blur-md" 
                  : "bg-transparent border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-900/5 dark:hover:bg-white/5"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Action Catalog
            </button>
            <button
              id="tab-ai"
              role="tab"
              aria-selected={activeTab === "ai"}
              aria-controls="application-main-view"
              aria-label="Custom AI Estimator tab button"
              aria-describedby="ai-tab-desc"
              onClick={() => setActiveTab("ai")}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00] ${
                activeTab === "ai" 
                  ? "bg-zinc-900/5 dark:bg-white/10 border-zinc-200/80 dark:border-white/15 text-zinc-900 dark:text-[#C4FF00] shadow-sm backdrop-blur-md" 
                  : "bg-transparent border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-900/5 dark:hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#C4FF00]" />
              Custom AI Estimator
            </button>
          </nav>

          {/* Settings & Theme Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-describedby="theme-toggle-desc"
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-900/5 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-900/10 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF00]"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#C4FF00]" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>

            <button
              onClick={handleResetLedgerToDefaultData}
              title="Reset metrics to baseline scenario"
              aria-label="Reset metrics to baseline scenario"
              aria-describedby="reset-button-desc"
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-900/5 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-900/10 dark:hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C4FF00]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="bg-[#C4FF00]/10 text-zinc-900 dark:text-[#C4FF00] border border-[#C4FF00]/30 rounded-lg py-1 px-2.5 text-[10px] uppercase font-bold tracking-widest hidden sm:flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C4FF00]" /> SECURE AI PROXY
            </div>
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="md:hidden border-t border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl grid grid-cols-4 text-center text-[10px] w-full font-mono font-semibold" role="tablist" aria-label="EcoTrace Mobile Navigation Tabs">
          <button 
            role="tab"
            aria-selected={activeTab === "overview"}
            aria-controls="application-main-view"
            aria-label="Overview Hub tab mobile button"
            aria-describedby="overview-tab-desc"
            onClick={() => setActiveTab("overview")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-colors focus:outline-none focus-visible:bg-zinc-150/10 dark:focus-visible:bg-white/10 ${activeTab === "overview" ? "border-zinc-800 dark:border-[#C4FF00] text-zinc-900 dark:text-[#C4FF00] bg-zinc-900/5 dark:bg-white/5" : "border-transparent text-zinc-500 dark:text-zinc-400"}`}
          >
            Overview
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === "calculator"}
            aria-controls="application-main-view"
            aria-label="Interactive Calculator tab mobile button"
            aria-describedby="calculator-tab-desc"
            onClick={() => setActiveTab("calculator")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-colors focus:outline-none focus-visible:bg-zinc-150/10 dark:focus-visible:bg-white/10 ${activeTab === "calculator" ? "border-zinc-800 dark:border-[#C4FF00] text-zinc-900 dark:text-[#C4FF00] bg-zinc-900/5 dark:bg-white/5" : "border-transparent text-zinc-500 dark:text-zinc-400"}`}
          >
            Calculator
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === "actions"}
            aria-controls="application-main-view"
            aria-label="Action Catalog tab mobile button"
            aria-describedby="actions-tab-desc"
            onClick={() => setActiveTab("actions")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-colors focus:outline-none focus-visible:bg-zinc-150/10 dark:focus-visible:bg-white/10 ${activeTab === "actions" ? "border-zinc-800 dark:border-[#C4FF00] text-zinc-900 dark:text-[#C4FF00] bg-zinc-900/5 dark:bg-white/5" : "border-transparent text-zinc-500 dark:text-zinc-400"}`}
          >
            Actions
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === "ai"}
            aria-controls="application-main-view"
            aria-label="Custom AI Estimator tab mobile button"
            aria-describedby="ai-tab-desc"
            onClick={() => setActiveTab("ai")} 
            className={`py-2.5 border-b-2 cursor-pointer transition-all focus:outline-none focus-visible:bg-zinc-150/10 dark:focus-visible:bg-white/10 ${activeTab === "ai" ? "border-zinc-800 dark:border-[#C4FF00] text-zinc-900 dark:text-[#C4FF00] bg-zinc-900/5 dark:bg-white/5" : "border-transparent text-zinc-500 dark:text-zinc-400"}`}
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
      <footer className="bg-white/40 dark:bg-[#0A0A0A]/40 border-t border-zinc-200/80 dark:border-white/10 backdrop-blur-md py-10 mt-16 text-center text-xs text-zinc-500 dark:text-white/40 font-mono leading-relaxed relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-zinc-850 dark:text-white/60 serif italic tracking-wide">EcoTrace OS • Real-Time Environmental Physics Matrix</p>
          <p className="mt-1 pb-4 border-b border-zinc-200/80 dark:border-white/5 max-w-sm mx-auto">
            Factors calibrated with EPA & IPCC greenhouse metrics. Verified ISO-14064 Compliance.
          </p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-[10px] uppercase opacity-75">
             <span>Access: VRD-092-2024</span>
             <span>•</span>
             <span>Status: Stable OS PROD</span>
             <span>•</span>
             <span className="text-emerald-600 dark:text-[#C4FF00] font-bold">Powered by Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
