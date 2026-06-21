import React, { useState, useMemo } from "react";
import { EcoAction, CarbonCategory } from "../types";
import { PREDEFINED_ACTIONS } from "../data/predefinedActions";
import { 
  Lightbulb, 
  Apple, 
  Train, 
  Wind, 
  Users, 
  Bike, 
  Milk, 
  Thermometer, 
  Trash2, 
  Check, 
  Plus, 
  BookmarkCheck,
  TrendingDown,
  Sparkles,
  FlameKindling
} from "lucide-react";

interface ActionPlannerProps {
  activeActionIdMap: Record<string, "active" | "completed">;
  onToggleAction: (actionId: string, itemSavings: number) => void;
  onLogCompletedSingleAction: (actionId: string, actionName: string, category: CarbonCategory, savingsKg: number) => void;
}

// Icon mapper helper
const getActionIcon = (iconName: string) => {
  switch (iconName) {
    case "Lightbulb": return <Lightbulb className="w-5 h-5 text-sky-400" />;
    case "Apple": return <Apple className="w-5 h-5 text-rose-400" />;
    case "FlameKindling": return <FlameKindling className="w-5 h-5 text-amber-500" />;
    case "Train": return <Train className="w-5 h-5 text-violet-400" />;
    case "Wind": return <Wind className="w-5 h-5 text-emerald-400" />;
    case "Users": return <Users className="w-5 h-5 text-teal-400" />;
    case "Bike": return <Bike className="w-5 h-5 text-[#C4FF00]" />;
    case "Milk": return <Milk className="w-5 h-5 text-fuchsia-400" />;
    case "Thermometer": return <Thermometer className="w-5 h-5 text-rose-400" />;
    case "Trash2": return <Trash2 className="w-5 h-5 text-white/50" />;
    default: return <BookmarkCheck className="w-5 h-5 text-white/80" />;
  }
};

export default function ActionPlanner({
  activeActionIdMap,
  onToggleAction,
  onLogCompletedSingleAction
}: ActionPlannerProps) {
  const [activeTab, setActiveTab] = useState<CarbonCategory | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");

  const filteredActions = useMemo(() => {
    return PREDEFINED_ACTIONS.filter((action) => {
      const matchTab = activeTab === "all" || action.category === activeTab;
      const matchDiff = difficultyFilter === "all" || action.difficulty === difficultyFilter;
      return matchTab && matchDiff;
    });
  }, [activeTab, difficultyFilter]);

  const activeCount = useMemo(() => {
    return Object.values(activeActionIdMap).filter(status => status === "active").length;
  }, [activeActionIdMap]);

  return (
    <div className="space-y-6" id="planner-main-container">
      {/* Intro Header Details */}
      <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm dark:shadow-none transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4FF00]/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h2 className="text-xl font-serif italic text-zinc-900 dark:text-white tracking-wide font-semibold">
            Action Network
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 max-w-xl font-sans leading-relaxed">
            Adopt verified ecological habits and circular offsets. Activating a habit factors their carbon deduction into your weekly metrics.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono shrink-0">
          <div className="bg-zinc-900/5 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800/85 px-4 py-2.5 rounded-xl">
            <span className="text-zinc-500 dark:text-zinc-400 block uppercase text-[10px] tracking-wider mb-0.5 font-bold">Active Habits</span>
            <strong className="text-zinc-900 dark:text-white text-md font-bold">{activeCount} Adopted</strong>
          </div>
          <div className="bg-[#C4FF00]/10 border border-[#C4FF00]/25 px-4 py-2.5 rounded-xl">
            <span className="text-[#A2E000] dark:text-[#C4FF00] block uppercase text-[10px] tracking-wider mb-0.5 font-black">Current Rate</span>
            <strong className="text-zinc-900 dark:text-white text-md flex items-center gap-1.5 font-bold">
              <TrendingDown className="w-4 h-4 text-emerald-605 dark:text-[#C4FF00]" />
              {PREDEFINED_ACTIONS.reduce((sum, item) => {
                const status = activeActionIdMap[item.id];
                return sum + (status === "active" ? item.co2SavedPerWeek : 0);
              }, 0).toFixed(1)} kg / wk
            </strong>
          </div>
        </div>
      </div>

      {/* Filter menu bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-mono" role="tablist" aria-label="Habit categories">
          {["all", "transport", "energy", "diet", "lifestyle"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              role="tab"
              aria-selected={activeTab === tab}
              className={`px-3.5 py-1.5 rounded-lg border capitalize cursor-pointer transition-all font-bold focus:outline-none ${
                activeTab === tab 
                  ? "bg-[#C4FF00] border-transparent text-black" 
                  : "bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="text-zinc-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider font-bold">Difficulty:</span>
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#0A0A0A]">
            {["all", "easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff as any)}
                aria-pressed={difficultyFilter === diff}
                className={`px-3 py-1.5 border-r border-zinc-200 dark:border-zinc-800 last:border-0 capitalize cursor-pointer transition-all focus:outline-none ${
                  difficultyFilter === diff 
                    ? "bg-[#C4FF00] font-bold text-black" 
                    : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Habits Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="filtered-actions-layout-grid">
        {filteredActions.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-zinc-500 dark:text-white/40 border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl p-6 bg-zinc-950/[0.01] dark:bg-[#0A0A0A]/40 flex flex-col items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#A2E000] dark:text-[#C4FF00]/40 mb-3" />
            <p className="text-xs font-mono">No actions matched the filtered selection matrix.</p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const status = activeActionIdMap[action.id];
            const isAdopted = status === "active";

            return (
              <div 
                key={action.id} 
                className={`bg-white/60 dark:bg-zinc-950/45 backdrop-blur-md border rounded-2xl p-5.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  isAdopted 
                    ? "border-[#C4FF00] dark:border-[#C4FF00]/40 shadow-[0_4px_24px_rgba(196,255,0,0.04)] bg-white/90 dark:bg-zinc-950/65" 
                    : "border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
                id={`eco-action-card-${action.id}`}
              >
                {/* Accent line when active */}
                {isAdopted && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C4FF00]" />
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border uppercase font-mono text-[9px] font-bold ${
                      action.category === "transport" ? "bg-amber-400/10 text-amber-550 dark:text-amber-400 border-amber-405/20" :
                      action.category === "energy" ? "bg-sky-500/10 text-sky-550 dark:text-sky-450 border-sky-405/20" :
                      action.category === "diet" ? "bg-rose-500/10 text-rose-550 dark:text-rose-455 border-rose-405/20" :
                      "bg-[#C4FF00]/10 text-emerald-700 dark:text-[#C4FF00] border-[#C4FF00]/25"
                    }`}>
                      {getActionIcon(action.icon)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                        action.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                        action.difficulty === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}>
                        {action.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-white mt-4 leading-snug">
                    {action.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal font-sans">
                    {action.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/85 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block font-mono font-bold">Offset value:</span>
                    <strong className="text-emerald-705 dark:text-[#C4FF00] font-mono text-xs font-bold leading-normal">
                      -{action.co2SavedPerWeek.toFixed(1)} kg CO2e / wk
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    {isAdopted ? (
                      <>
                        <button
                          onClick={() => onLogCompletedSingleAction(
                            action.id,
                            `One-time: ${action.name}`,
                            action.category,
                            action.co2SavedPerWeek
                          )}
                          className="px-3 py-1.5 bg-[#C4FF00] hover:bg-zinc-800 hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-extrabold uppercase rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-[10px] focus:outline-none"
                        >
                          <Check className="w-3.5 h-3.5" /> Log Done
                        </button>
                        <button
                          onClick={() => onToggleAction(action.id, action.co2SavedPerWeek)}
                          className="px-2.5 py-1.5 text-red-600 dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-300 font-bold uppercase text-[10px] cursor-pointer focus:outline-none"
                        >
                          Drop
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onToggleAction(action.id, action.co2SavedPerWeek)}
                        className="px-3 py-1.5 bg-zinc-900/5 dark:bg-white/5 hover:bg-zinc-900/10 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold uppercase rounded-lg text-[10px] cursor-pointer flex items-center gap-1.5 transition-all focus:outline-none"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#A2E000] dark:text-[#C4FF00]" /> Adopt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
