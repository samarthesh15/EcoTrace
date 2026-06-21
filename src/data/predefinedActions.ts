import { EcoAction } from "../types";

export const PREDEFINED_ACTIONS: EcoAction[] = [
  {
    id: "action-led-bulbs",
    name: "Switch to LED Lighting",
    description: "Replace standard incandescent light bulbs with energy-efficient LED models.",
    category: "energy",
    co2SavedPerWeek: 1.5,
    icon: "Lightbulb",
    difficulty: "easy"
  },
  {
    id: "action-meat-free-monday",
    name: "Meatless Mondays",
    description: "Substitute animal protein with delicious plant-based alternatives just one day a week.",
    category: "diet",
    co2SavedPerWeek: 8.2,
    icon: "Apple",
    difficulty: "easy"
  },
  {
    id: "action-low-temp-wash",
    name: "Wash Clothes on Cold",
    description: "Wash garments and laundry at 30°C or colder to reduce boiler heating energy.",
    category: "energy",
    co2SavedPerWeek: 2.1,
    icon: "FlameKindling", // Representing cold wash replacement
    difficulty: "easy"
  },
  {
    id: "action-public-transit",
    name: "Take Public Transit",
    description: "Swap 3 solo car commutes per week for local bus, metro, or suburban train rides.",
    category: "transport",
    co2SavedPerWeek: 18.5,
    icon: "Train",
    difficulty: "medium"
  },
  {
    id: "action-line-drying",
    name: "Line-dry Your Laundry",
    description: "Hang-dry clothing items outdoors or on indoor racks instead of using the electric tumble dryer.",
    category: "energy",
    co2SavedPerWeek: 4.8,
    icon: "Wind",
    difficulty: "easy"
  },
  {
    id: "action-carpool",
    name: "Carpool to Work",
    description: "Share the ride with or pick up colleague commuters on your routine journeys.",
    category: "transport",
    co2SavedPerWeek: 12.0,
    icon: "Users",
    difficulty: "medium"
  },
  {
    id: "action-bike-short-trips",
    name: "Bike for Short Errands",
    description: "Commit to walking or cycling for all personal errands under 3 kilometers instead of driving.",
    category: "transport",
    co2SavedPerWeek: 6.5,
    icon: "Bike",
    difficulty: "medium"
  },
  {
    id: "action-avoid-dairy",
    name: "Substitute Dairy with Plant Milk",
    description: "Swap dairy milk in your coffee, oatmeal, and hot beverages for oat, almond, or soy milk.",
    category: "diet",
    co2SavedPerWeek: 3.4,
    icon: "Milk",
    difficulty: "easy"
  },
  {
    id: "action-reducing-heating",
    name: "Lower Thermostat by 1°C",
    description: "Turn down home heating thermostat slightly and supplement with comfortable warm clothing layers.",
    category: "energy",
    co2SavedPerWeek: 5.2,
    icon: "Thermometer",
    difficulty: "medium"
  },
  {
    id: "action-combat-food-waste",
    name: "Zero Weekly Food Waste",
    description: "Plan meals tightly, buy exact quantities, freeze excess, and utilize leftovers fully to prevent landfill gas production.",
    category: "lifestyle",
    co2SavedPerWeek: 7.0,
    icon: "Trash2",
    difficulty: "hard"
  }
];
