import React, { useState, useEffect } from "react";
import { CarbonCategory } from "../types";
import { 
  Car, 
  Flame, 
  UtensilsCrossed, 
  ShoppingBag, 
  Plane, 
  Lightbulb, 
  Save,
  Check
} from "lucide-react";

interface CarbonCalculatorProps {
  onAddLog: (category: CarbonCategory, name: string, value: number) => void;
  onClearCategoryLogs: (category: CarbonCategory) => void;
  logs: any[];
}

export default function CarbonCalculator({
  onAddLog,
  onClearCategoryLogs,
  logs
}: CarbonCalculatorProps) {
  // Transports State
  const [carKm, setCarKm] = useState(150); // km/week
  const [carFuelType, setCarFuelType] = useState<"petrol" | "diesel" | "hybrid" | "electric">("petrol");
  const [transitKm, setTransitKm] = useState(50); // km/week
  const [flightsPerYear, setFlightsPerYear] = useState(2); // count

  // Household Utilities state
  const [electricityKwh, setElectricityKwh] = useState(300); // kWh/month
  const [gasKwh, setGasKwh] = useState(150); // kWh/month
  const [cleanEnergyRatio, setCleanEnergyRatio] = useState(0); // % of clean energy

  // Diet preference state
  const [meatConsumption, setMeatConsumption] = useState<"heavy-red" | "balanced" | "vegetarian" | "vegan">("balanced");

  // Lifestyle shopping context
  const [shoppingTier, setShoppingTier] = useState<"minimalist" | "average" | "enthusiast">("average");
  const [recycleRatio, setRecycleRatio] = useState(50); // % recycled

  // Save state indicator
  const [savedCategories, setSavedCategories] = useState<Record<string, boolean>>({});

  // Calculations
  const calculatedTransportCarbon = Math.round(
    (carKm * 52 * (carFuelType === "petrol" ? 0.21 : carFuelType === "diesel" ? 0.19 : carFuelType === "hybrid" ? 0.11 : 0.05)) +
    (transitKm * 52 * 0.04) +
    (flightsPerYear * 650)
  );

  const calculatedEnergyCarbon = Math.round(
    (electricityKwh * 12 * 0.42 * (1 - cleanEnergyRatio / 100)) +
    (gasKwh * 12 * 0.20)
  );

  const calculatedDietCarbon = 
    meatConsumption === "heavy-red" ? 3300 :
    meatConsumption === "balanced" ? 2300 :
    meatConsumption === "vegetarian" ? 1700 :
    1400; // vegan

  const calculatedLifestyleCarbon = Math.round(
    (shoppingTier === "minimalist" ? 800 : shoppingTier === "average" ? 1600 : 3400) * 
    (1 - (recycleRatio / 100) * 0.15)
  );

  const totalCalculatedFootprint = calculatedTransportCarbon + calculatedEnergyCarbon + calculatedDietCarbon + calculatedLifestyleCarbon;

  const handleSaveSubCategory = (category: CarbonCategory) => {
    // 1. Wipe previous logged calculations for this specific automatic category
    onClearCategoryLogs(category);

    // 2. Insert calculated parameters
    if (category === "transport") {
      onAddLog("transport", `Driving commute (${carFuelType})`, Math.round(carKm * 52 * (carFuelType === "petrol" ? 0.21 : carFuelType === "diesel" ? 0.19 : carFuelType === "hybrid" ? 0.11 : 0.05)));
      if (transitKm > 0) {
        onAddLog("transport", "Public transport use", Math.round(transitKm * 52 * 0.04));
      }
      if (flightsPerYear > 0) {
        onAddLog("transport", "Annual airline flights", flightsPerYear * 650);
      }
    } else if (category === "energy") {
      onAddLog("energy", "Grid Electricity Usage", Math.round(electricityKwh * 12 * 0.42 * (1 - cleanEnergyRatio / 100)));
      if (gasKwh > 0) {
        onAddLog("energy", "Natural Gas Utilities", Math.round(gasKwh * 12 * 0.20));
      }
    } else if (category === "diet") {
      onAddLog("diet", `Diet plan: ${meatConsumption}`, calculatedDietCarbon);
    } else if (category === "lifestyle") {
      onAddLog("lifestyle", `Lifestyle: Shopping tier: ${shoppingTier}`, calculatedLifestyleCarbon);
    }

    setSavedCategories(prev => ({ ...prev, [category]: true }));
    setTimeout(() => {
      setSavedCategories(prev => ({ ...prev, [category]: false }));
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="calculator-section-layout">
      {/* Real-time calculated scale summary float left */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24" id="sticky-calculator-summary">
        <div className="bg-[#0A0A0A] border border-white/10 text-white p-7 rounded-2xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4FF00]/5 rounded-full blur-2xl pointer-events-none" />

          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4FF00]/80 font-mono block">Live Assessment</span>
          <h2 className="text-xl font-serif italic font-semibold mt-1 text-white tracking-wide">Interactive Footprint</h2>

          <div className="my-8">
            <span className="text-5xl font-mono font-black text-[#C4FF00] tracking-widest leading-none block">
              {totalCalculatedFootprint.toLocaleString()}
            </span>
            <span className="text-[11px] text-white/40 block font-mono uppercase mt-2 tracking-wider">Estimated annual kg CO2e</span>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-5 text-xs text-white/70 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="flex items-center gap-1.5 text-white/50"><Car className="w-3.5 h-3.5 text-amber-400" /> Mobility</span>
              <span className="font-semibold text-white">{calculatedTransportCarbon.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="flex items-center gap-1.5 text-white/50"><Lightbulb className="w-3.5 h-3.5 text-sky-400" /> Home Utilities</span>
              <span className="font-semibold text-white">{calculatedEnergyCarbon.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="flex items-center gap-1.5 text-white/50"><UtensilsCrossed className="w-3.5 h-3.5 text-rose-400" /> Diet Habits</span>
              <span className="font-semibold text-white">{calculatedDietCarbon.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-white/50"><ShoppingBag className="w-3.5 h-3.5 text-[#C4FF00]" /> Consumerism</span>
              <span className="font-semibold text-white">{calculatedLifestyleCarbon.toLocaleString()} kg</span>
            </div>
          </div>

          <div className="mt-8 bg-white/5 p-4 rounded-xl text-xs text-white/60 border border-white/10 leading-relaxed">
            💡 Adjust inputs below. Click the <strong className="text-[#C4FF00] font-bold">&ldquo;Sync Profile&rdquo;</strong> icons on any category panel to write metrics to your main ledger history.
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 relative">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4FF00]/80 block mb-3 font-mono">Climate Benchmarks</span>
          <p className="text-xs text-white/60 leading-relaxed mb-4">
            Compare your estimated footprint ({totalCalculatedFootprint} kg) to global annual standards:
          </p>
          <div className="space-y-3 font-mono text-[11px] uppercase tracking-wider">
            <div className="flex justify-between text-white/60 border-b border-white/5 pb-2">
              <span>UN Target (For 2030):</span>
              <span className="font-bold text-[#C4FF00]">2,000 kg / yr</span>
            </div>
            <div className="flex justify-between text-white/60 border-b border-white/5 pb-2">
              <span>European Average:</span>
              <span className="font-bold text-white">6,500 kg / yr</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>North American Avg:</span>
              <span className="font-bold text-white">14,200 kg / yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders adjustments right */}
      <div className="lg:col-span-8 space-y-6">
        {/* Category 1: Transport */}
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10" id="calculator-category-transport">
          <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/10">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-serif italic text-white tracking-wide font-semibold">Transport Emissions</h3>
                <p className="text-xs text-white/45 font-mono uppercase tracking-wider">Vehicle commutes, transits and airline schedules</p>
              </div>
            </div>
            <button
              onClick={() => handleSaveSubCategory("transport")}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                savedCategories["transport"] 
                  ? "bg-[#C4FF00] text-black" 
                  : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10"
              }`}
            >
              {savedCategories["transport"] ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-[#C4FF00]" />}
              {savedCategories["transport"] ? "Synced" : "Sync Profile"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Solo Car KM Slider */}
            <div>
              <div className="flex justify-between text-xs text-white/75 mb-2 font-mono">
                <span>Personal Car Driving: <strong className="text-white text-sm font-sans">{carKm} km</strong> / week</span>
                <span className="text-white/40">Emits ~{(carKm * 52 * (carFuelType === "petrol" ? 0.21 : carFuelType === "diesel" ? 0.19 : carFuelType === "hybrid" ? 0.11 : 0.05)).toFixed(0)} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="800" 
                value={carKm} 
                onChange={(e) => setCarKm(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C4FF00]"
                id="car-km-slider"
              />
            </div>

            {/* Car Fuel Type selects */}
            {carKm > 0 && (
              <div>
                <span className="block text-xs text-white/50 mb-2 font-mono uppercase tracking-wider">Engine/Fuel Selection:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {["petrol", "diesel", "hybrid", "electric"].map((fuel) => (
                    <button
                      key={fuel}
                      type="button"
                      onClick={() => setCarFuelType(fuel as any)}
                      className={`text-center py-2 px-3 border rounded-lg capitalize cursor-pointer transition-all font-bold ${
                        carFuelType === fuel 
                          ? "bg-[#C4FF00] border-transparent text-black" 
                          : "bg-[#050505] border-white/10 hover:border-white/30 text-white/50 hover:text-white"
                      }`}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Public Transit use */}
            <div>
              <div className="flex justify-between text-xs text-white/75 mb-2 font-mono">
                <span>Public Transit (Bus, Train): <strong className="text-white text-sm font-sans">{transitKm} km</strong> / week</span>
                <span className="text-white/40">Emits ~{(transitKm * 52 * 0.04).toFixed(0)} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="500" 
                value={transitKm} 
                onChange={(e) => setTransitKm(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C4FF00]"
              />
            </div>

            {/* Annual flight numbers */}
            <div>
              <div className="flex justify-between text-xs text-white/75 mb-2 font-mono">
                <span>airline flights schedule: <strong className="text-white text-sm font-sans">{flightsPerYear} flights</strong> / year</span>
                <span className="text-white/40">Emits ~{(flightsPerYear * 650).toLocaleString()} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="15" 
                value={flightsPerYear} 
                onChange={(e) => setFlightsPerYear(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C4FF00]"
              />
            </div>
          </div>
        </div>

        {/* Category 2: Utilities & Home Energy */}
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10" id="calculator-category-energy">
          <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/10">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-serif italic text-white tracking-wide font-semibold">Utilities & Home Energy</h3>
                <p className="text-xs text-white/45 font-mono uppercase tracking-wider">Electric consumption, boiler utility, heating source & offsets</p>
              </div>
            </div>
            <button
              onClick={() => handleSaveSubCategory("energy")}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                savedCategories["energy"] 
                  ? "bg-[#C4FF00] text-black" 
                  : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10"
              }`}
            >
              {savedCategories["energy"] ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-[#C4FF00]" />}
              {savedCategories["energy"] ? "Synced" : "Sync Profile"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Electricity cost */}
            <div>
              <div className="flex justify-between text-xs text-white/75 mb-2 font-mono">
                <span>Electricity consumption volume: <strong className="text-white text-sm font-sans">{electricityKwh} kWh</strong> / month</span>
                <span className="text-white/40">Base Impact: ~{(electricityKwh * 12 * 0.42).toFixed(0)} kg CO2</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="1200" 
                value={electricityKwh} 
                onChange={(e) => setElectricityKwh(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C4FF00]"
              />
            </div>

            {/* Clean Energy offset slider if applicable */}
            <div>
              <div className="flex justify-between text-xs text-white/75 mb-2 font-mono">
                <span>Renewable / Solar Energy Share: <strong className="text-white text-sm font-sans">{cleanEnergyRatio}%</strong></span>
                <span className="text-[#C4FF00] font-sans">Saves -{(electricityKwh * 12 * 0.42 * (cleanEnergyRatio / 100)).toFixed(0)} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={cleanEnergyRatio} 
                onChange={(e) => setCleanEnergyRatio(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C4FF00]"
              />
            </div>

            {/* Natural Gas */}
            <div>
              <div className="flex justify-between text-xs text-white/75 mb-2 font-mono">
                <span>Gas Utility / Boiler consumption: <strong className="text-white text-sm font-sans">{gasKwh} kWh</strong> / month</span>
                <span className="text-white/40">Emits ~{(gasKwh * 12 * 0.20).toFixed(0)} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                value={gasKwh} 
                onChange={(e) => setGasKwh(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C4FF00]"
              />
            </div>
          </div>
        </div>

        {/* Category 3: Diet Preference */}
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10" id="calculator-category-diet">
          <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-450/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-400/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-serif italic text-white tracking-wide font-semibold">Food & Nutrition Profiles</h3>
                <p className="text-xs text-white/45 font-mono uppercase tracking-wider">Agricultural logistics, red meat footprint and production factors</p>
              </div>
            </div>
            <button
              onClick={() => handleSaveSubCategory("diet")}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                savedCategories["diet"] 
                  ? "bg-[#C4FF00] text-black" 
                  : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10"
              }`}
            >
              {savedCategories["diet"] ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-[#C4FF00]" />}
              {savedCategories["diet"] ? "Synced" : "Sync Profile"}
            </button>
          </div>

          <div>
            <span className="block text-xs text-white/50 mb-3 font-mono uppercase tracking-wider">Choose food profile tier:</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setMeatConsumption("heavy-red")}
                className={`text-left p-4.5 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                  meatConsumption === "heavy-red" 
                    ? "bg-[#C4FF00] border-transparent text-black" 
                    : "bg-[#050505] border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                }`}
              >
                <div>
                  <span className={`font-bold block mb-0.5 ${meatConsumption === "heavy-red" ? "text-black" : "text-white"}`}>Heavy Beef</span>
                  <span className={`text-[10px] block font-mono hover:text-inherit normal-case ${meatConsumption === "heavy-red" ? "text-black/70" : "text-white/40"}`}>Includes daily beef, pork, lamb</span>
                </div>
                <span className={`font-mono text-sm font-bold mt-4 block ${meatConsumption === "heavy-red" ? "text-black" : "text-[#C4FF00]"}`}>~3,300 kg</span>
              </button>

              <button
                type="button"
                onClick={() => setMeatConsumption("balanced")}
                className={`text-left p-4.5 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                  meatConsumption === "balanced" 
                    ? "bg-[#C4FF00] border-transparent text-black" 
                    : "bg-[#050505] border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                }`}
              >
                <div>
                  <span className={`font-bold block mb-0.5 ${meatConsumption === "balanced" ? "text-black" : "text-white"}`}>Balanced Diet</span>
                  <span className={`text-[10px] block font-mono hover:text-inherit normal-case ${meatConsumption === "balanced" ? "text-black/70" : "text-white/40"}`}>Poultry, fish and minor red meats</span>
                </div>
                <span className={`font-mono text-sm font-bold mt-4 block ${meatConsumption === "balanced" ? "text-black" : "text-[#C4FF00]"}`}>~2,300 kg</span>
              </button>

              <button
                type="button"
                onClick={() => setMeatConsumption("vegetarian")}
                className={`text-left p-4.5 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                  meatConsumption === "vegetarian" 
                    ? "bg-[#C4FF00] border-transparent text-black" 
                    : "bg-[#050505] border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                }`}
              >
                <div>
                  <span className={`font-bold block mb-0.5 ${meatConsumption === "vegetarian" ? "text-black" : "text-white"}`}>Vegetarian</span>
                  <span className={`text-[10px] block font-mono hover:text-inherit normal-case ${meatConsumption === "vegetarian" ? "text-black/70" : "text-white/40"}`}>Dairy, egg sources. No livestock meat</span>
                </div>
                <span className={`font-mono text-sm font-bold mt-4 block ${meatConsumption === "vegetarian" ? "text-black" : "text-[#C4FF00]"}`}>~1,700 kg</span>
              </button>

              <button
                type="button"
                onClick={() => setMeatConsumption("vegan")}
                className={`text-left p-4.5 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                  meatConsumption === "vegan" 
                    ? "bg-[#C4FF00] border-transparent text-black" 
                    : "bg-[#050505] border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                }`}
              >
                <div>
                  <span className={`font-bold block mb-0.5 ${meatConsumption === "vegan" ? "text-black" : "text-white"}`}>Vegan Plan</span>
                  <span className={`text-[10px] block font-mono hover:text-inherit normal-case ${meatConsumption === "vegan" ? "text-black/70" : "text-white/40"}`}>Purely plant-based nutrition matrix</span>
                </div>
                <span className={`font-mono text-sm font-bold mt-4 block ${meatConsumption === "vegan" ? "text-black" : "text-[#C4FF00]"}`}>~1,400 kg</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category 4: Lifestyle Consumerism */}
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10" id="calculator-category-lifestyle">
          <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C4FF00]/10 text-[#C4FF00] flex items-center justify-center shrink-0 border border-[#C4FF00]/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-serif italic text-white tracking-wide font-semibold">Consumer Lifestyle</h3>
                <p className="text-xs text-white/45 font-mono uppercase tracking-wider">Purchase ratios, heavy spending and waste recycling metrics</p>
              </div>
            </div>
            <button
              onClick={() => handleSaveSubCategory("lifestyle")}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                savedCategories["lifestyle"] 
                  ? "bg-[#C4FF00] text-black" 
                  : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10"
              }`}
            >
              {savedCategories["lifestyle"] ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-[#C4FF00]" />}
              {savedCategories["lifestyle"] ? "Synced" : "Sync Profile"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Purchase tier selection */}
            <div>
              <span className="block text-xs text-white/50 mb-2 font-mono uppercase tracking-wider">Monthly Shopping & Retail intensity:</span>
              <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                {["minimalist", "average", "enthusiast"].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setShoppingTier(tier as any)}
                    className={`text-center py-2.5 px-3 border rounded-lg capitalize cursor-pointer font-bold transition-all ${
                      shoppingTier === tier 
                        ? "bg-[#C4FF00] border-transparent text-black" 
                        : "bg-[#050505] border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                    }`}
                  >
                    {tier === "minimalist" ? "Minimalist" : tier === "average" ? "Modest" : "High Spender"}
                  </button>
                ))}
              </div>
            </div>

            {/* Recycling metrics */}
            <div>
              <div className="flex justify-between text-xs text-white/75 mb-2 font-mono">
                <span>Household Recycling & Circularity: <strong className="text-white text-sm font-sans">{recycleRatio}%</strong></span>
                <span className="text-[#C4FF00]">Saves -{Math.round((shoppingTier === "minimalist" ? 800 : shoppingTier === "average" ? 1600 : 3400) * (recycleRatio / 100) * 0.15)} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={recycleRatio} 
                onChange={(e) => setRecycleRatio(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C4FF00]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
