import React, { useState } from "react";
import { CarbonCategory, CustomFootprintEstimate } from "../types";
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  BookmarkPlus,
  Loader2,
  Trash2
} from "lucide-react";

interface AiAssistantProps {
  onAddLog: (category: CarbonCategory, name: string, value: number) => void;
}

const PRESET_QUERIES = [
  "Impact of buying a new smartphone",
  "Emissions of an 800km commercial flight",
  "Footprint of eating a beef burger",
  "Using an electric tumble dryer for 1 hour",
  "Streaming 4K video for 20 hours"
];

export default function AiAssistant({ 
  onAddLog 
}: AiAssistantProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CarbonCategory>("lifestyle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimateResult, setEstimateResult] = useState<CustomFootprintEstimate | null>(null);
  const [savedToLedger, setSavedToLedger] = useState(false);

  const handleQueryEstimator = async (searchString: string) => {
    if (!searchString.trim()) return;
    setLoading(true);
    setError(null);
    setEstimateResult(null);
    setSavedToLedger(false);

    try {
      const res = await fetch("/api/gemini/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchString, activeCategory })
      });

      if (!res.ok) {
        throw new Error("The custom estimation request failed. Please check backend integration.");
      }

      const data = await res.json();
      setEstimateResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong modeling calculations.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogToLedger = () => {
    if (!estimateResult) return;
    onAddLog(estimateResult.category, `AI Estimate: ${estimateResult.name}`, estimateResult.estimatedCo2);
    setSavedToLedger(true);
    setTimeout(() => {
      setSavedToLedger(false);
    }, 2000);
  };

  return (
    <div className="space-y-8" id="ai-assistant-wrapper">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Search controls Left */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4FF00]/5 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4FF00]/80 block mb-1.5 font-mono">Dynamic AI Modeling</span>
            <h2 className="text-xl font-serif italic text-white tracking-wide font-semibold">Footprint Sandbox</h2>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Describe any item, product, device lifecycle, shipping timeline, or recipe. Gemini will instantly trace and compute its greenhouse coefficient.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleQueryEstimator(query);
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-[10px] text-white/40 uppercase font-mono font-bold mb-2 tracking-wider">Action or Item to Analyze</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="e.g. buying 1kg of avocados flown from Peru"
                    className="w-full bg-[#050505] border border-white/10 hover:border-white/20 text-xs pl-10 pr-4 py-3 rounded-xl focus:border-[#C4FF00]/60 outline-hidden font-sans text-white transition-colors"
                    required
                  />
                  <Search className="w-4 h-4 text-white/45 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <span className="block text-[10px] text-white/40 uppercase font-mono font-bold mb-2 tracking-wider">Likeliest Category</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { id: "transport", label: "Mobility" },
                    { id: "energy", label: "Home energy" },
                    { id: "diet", label: "Diet & Food" },
                    { id: "lifestyle", label: "Lifestyle" }
                  ].map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.id as any)}
                      className={`text-left py-2 px-3 border rounded-lg transition-all font-bold cursor-pointer ${
                        activeCategory === category.id 
                          ? "bg-[#C4FF00] border-transparent text-black" 
                          : "bg-[#050505] border-white/10 hover:border-white/30 text-white/50 hover:text-white"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#C4FF00] hover:bg-white text-black font-semibold font-mono uppercase tracking-widest text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Calculating Footprints...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    Analyze with Gemini AI
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3 font-mono">Popular Estimations</span>
            <div className="space-y-2 font-mono">
              {PRESET_QUERIES.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setQuery(preset);
                    handleQueryEstimator(preset);
                  }}
                  className="w-full text-left text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 px-3.5 rounded-lg transition-colors cursor-pointer block truncate"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Pane Right */}
        <div className="lg:col-span-12 xl:col-span-7">
          {loading ? (
            <div className="h-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Loader2 className="w-12 h-12 text-[#C4FF00] animate-spin mb-4" />
              <h2 className="text-xl font-serif italic text-white mb-2">Analyzing Environmental Physics...</h2>
              <p className="text-xs text-white/50 max-w-sm mt-1 mb-8 leading-relaxed font-sans">
                Gemini is tracing structural supply chains, logistical footprints, and agricultural scopes to estimate total greenhouse impacts.
              </p>
              <div className="w-full max-w-sm bg-white/5 border border-white/10 p-5 rounded-2xl text-left space-y-2 text-xs text-white/60 font-mono">
                <span className="text-[10px] font-bold text-[#C4FF00] block uppercase tracking-wider">Did You Know?</span>
                <p className="leading-relaxed">
                  Shipping goods by cargo ship has ~10-20 times lower CO2 emissions per ton-kilometer compared to air freight, making localized buying crucial.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full bg-[#0A0A0A] border border-red-500/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h4 className="text-base font-semibold text-red-200 font-sans">Modeling Problem</h4>
              <p className="text-xs text-red-400/85 max-w-sm mt-1 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => handleQueryEstimator(query)}
                className="mt-6 px-4 py-2 border border-red-500/30 text-xs text-red-200 font-mono font-bold uppercase rounded-xl hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                Retry calculation
              </button>
            </div>
          ) : estimateResult ? (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6.5 space-y-6 relative overflow-hidden" id="ai-estimate-result-card">
              {/* Highlight ribbon based on category */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                estimateResult.category === "transport" ? "bg-amber-400" :
                estimateResult.category === "energy" ? "bg-sky-400" :
                estimateResult.category === "diet" ? "bg-rose-400" :
                "bg-[#C4FF00]"
              }`} />

              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest block font-bold">Estimated Item:</span>
                  <h3 className="text-lg font-serif italic text-white mt-1 first-letter:capitalize font-semibold tracking-wide">
                    {estimateResult.name}
                  </h3>
                </div>

                <div className="flex flex-col sm:items-end shrink-0">
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">Carbon footprint:</span>
                  <span className="text-3xl font-mono font-black text-[#C4FF00] mt-1">
                    {estimateResult.estimatedCo2.toLocaleString()} <span className="text-xs text-white/60 font-sans font-medium">kg CO2e</span>
                  </span>
                </div>
              </div>

              {/* Confidence factor */}
              <div>
                <div className="flex justify-between items-center text-xs text-white/50 mb-1.5 font-mono uppercase tracking-wider text-[9px]">
                  <span>Confidence Level:</span>
                  <span className="font-mono font-bold text-[#C4FF00]">{Math.round(estimateResult.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C4FF00] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(196,255,0,0.4)]" 
                    style={{ width: `${estimateResult.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Scientific explanation */}
              <div className="bg-[#050505] border border-white/10 rounded-2xl p-4.5 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-white/40 block uppercase tracking-widest">Genesis calculation trace</span>
                <p className="text-xs text-white/70 leading-relaxed font-sans font-normal">
                  {estimateResult.explanation}
                </p>
              </div>

              {/* Green Alternative */}
              <div className="border border-[#C4FF00]/25 bg-[#C4FF00]/5 rounded-2xl p-4.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-black bg-[#C4FF00] block uppercase tracking-widest px-2 py-0.5 rounded-md inline-block mb-1.5">
                    Sustainable alternative
                  </span>
                  <strong className="text-xs text-white block font-bold leading-snug font-sans">
                    {estimateResult.greenerAlternativeName}
                  </strong>
                </div>

                <div className="shrink-0">
                  <span className="text-[9px] font-mono font-bold text-[#C4FF00] uppercase tracking-widest block">Est. Reductions:</span>
                  <span className="font-mono text-white font-bold text-md flex items-center gap-1.5 mt-0.5">
                    <TrendingDown className="w-4 h-4 text-[#C4FF00] inline" />
                    -{estimateResult.alternativeSavings.toLocaleString()} kg / yr
                  </span>
                </div>
              </div>

              {/* Action insertion footer */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
                <p className="text-white/40 font-mono text-[10px] leading-relaxed text-center sm:text-left uppercase tracking-wide">
                  insert this physical element directly to keep ledger records correct
                </p>

                <button
                  onClick={handleLogToLedger}
                  disabled={savedToLedger}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shrink-0 cursor-pointer flex items-center gap-1.5 transition-all ${
                    savedToLedger 
                      ? "bg-[#C4FF00]/10 text-[#C4FF00] border border-[#C4FF00]/25" 
                      : "bg-[#C4FF00] hover:bg-white text-black shadow-xs"
                  }`}
                >
                  {savedToLedger ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#C4FF00]" />
                      Synced
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      Add to ledger
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#0A0A0A]/30 border border-white/10 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center py-24 min-h-[400px]">
              <Sparkles className="w-12 h-12 text-[#C4FF00]/40 mb-4 animate-pulse animate-duration-1000" />
              <h2 className="text-lg font-serif italic text-white tracking-wide font-semibold">Estimation Sandbox</h2>
              <p className="text-xs text-white/45 max-w-sm mt-1.5 leading-relaxed font-sans">
                Select a popular carbon estimation query from the left list or type your own custom scenario to run Gemini environmental footprint diagnostics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
