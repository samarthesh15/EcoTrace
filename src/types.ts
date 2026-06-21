/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Category types for carbon footprint tracking
export type CarbonCategory = "transport" | "energy" | "lifestyle" | "diet";

// Individual entry in the historical ledger
export interface FootprintLogEntry {
  id: string;
  date: string; // ISO string
  category: CarbonCategory;
  name: string; // e.g. "Weekly Commute", "Custom: Smartphone purchase"
  value: number; // in kg CO2e
  isOffset?: boolean; // If true, subtraction from footprint (e.g., planting tree, carbon credit)
}

// Predefined eco-friendly habit or action
export interface EcoAction {
  id: string;
  name: string;
  description: string;
  category: CarbonCategory;
  co2SavedPerWeek: number; // kg saved weekly
  icon: string; // Lucide icon reference string
  difficulty: "easy" | "medium" | "hard";
}

// User-tracked eco habit state
export interface UserEcoActionState {
  actionId: string;
  status: "active" | "completed";
  loggedAt: string; // ISO timestamp
}

// Goal definition for reduction
export interface CarbonReductionGoal {
  targetPercentage: number; // e.g. 20%
  baseFootprint: number; // base annual kg CO2e
  deadlineDate: string; // YYYY-MM-DD
}

// Struct for Gemini-estimated arbitrary activity
export interface CustomFootprintEstimate {
  name: string;
  estimatedCo2: number; // kg CO2e
  confidence: number; // 0 to 1 percentage score
  explanation: string;
  greenerAlternativeName: string;
  alternativeSavings: number; // kg saved by using alternative
  category: CarbonCategory;
}
