import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGoogleAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Host health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint: Estimate Carbon Impact of arbitrary item or query dynamically
app.post("/api/gemini/estimate", async (req, res) => {
  const { query, activeCategory } = req.body;
  if (!query) {
    res.status(400).json({ error: "Query parameter is required" });
    return;
  }

  const ai = getGoogleAI();
  if (!ai) {
    // Elegant fallback simulation is returned if Gemini key has not been in sandbox yet
    console.log("No valid Gemini API key found. Falling back to structured heuristic calculation.");
    const length = query.trim().length;
    res.json({
      name: query,
      estimatedCo2: Math.min(250.0, Math.max(0.5, +(length * 1.8).toFixed(1))),
      confidence: 0.65,
      explanation: `Heuristic calculation for: "${query}". (Add your real Gemini API Secret in the panel to enable scientifically modeled AI estimates!).`,
      greenerAlternativeName: "Sustainably-produced option",
      alternativeSavings: Math.max(0.2, +(length * 0.5).toFixed(1)),
      category: activeCategory || "lifestyle"
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Calculate/estimate the typical greenhouse gas emissions (carbon footprint) associated with: "${query}". Use natural, realistic physics and ecological valuations. Use category "${activeCategory || "lifestyle"}" if matching, otherwise infer correctly.`,
      config: {
        systemInstruction: "You are a professional IPCC-grade environmental scientist and carbon calculator. Provide structured, accurate greenhouse footprint logs in CO2e equivalent kilograms under conservative estimates, alongside real green options.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Official refined name of the action or item." },
            estimatedCo2: { type: Type.NUMBER, description: "Estimated kg carbon footprint output CO2e." },
            confidence: { type: Type.NUMBER, description: "Confidence level of calculation from 0.0 to 1.0 based on general consensus." },
            explanation: { type: Type.STRING, description: "A precise, informative single-sentence explanation of emissions source." },
            greenerAlternativeName: { type: Type.STRING, description: "A logical sustainable replacement or alternative." },
            alternativeSavings: { type: Type.NUMBER, description: "Typical numeric scale of CO2e in kg saved with this replacement." },
            category: { type: Type.STRING, description: "One of: transport, energy, lifestyle, diet" }
          },
          required: ["name", "estimatedCo2", "confidence", "explanation", "greenerAlternativeName", "alternativeSavings", "category"]
        }
      }
    });

    const textOutput = response.text?.trim() || "{}";
    const parsedData = JSON.parse(textOutput);
    res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini Estimate Error:", err);
    res.status(500).json({ error: "Failed to model carbon footprint estimate", details: err?.message || err });
  }
});

// Endpoint: Generate Personalized Eco-Coaching from current logs
app.post("/api/gemini/coach", async (req, res) => {
  const { logs, currentActiveSavings } = req.body;
  
  const ai = getGoogleAI();
  if (!ai) {
    res.json({
      summary: "You are tracking your habits locally. Please provide your Gemini API key in the secrets drawer to get deep AI-powered ecological profiling and expert recommendations!",
      annualProjectedEmissions: 4350.0,
      grade: "B",
      customTips: [
        { title: "Walk or bike short errands", description: "Choosing human power for all personal trips under 3km locks in steady gains.", potentialSavingsKg: 6.5 },
        { title: "Cook with saucepan lids on", description: "An effortless kitchen habit that saves instant induction energy.", potentialSavingsKg: 1.2 },
        { title: "De-clutter your inbox", description: "Saves marginal server electricity and reduces continuous active datacenter footprints.", potentialSavingsKg: 0.5 }
      ]
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Based on my current logged habits and calculator entries [${JSON.stringify(logs || [])}], and current weekly active habit savings is ${currentActiveSavings || 0} kg CO2e, provide personalized tips and profiling score.`,
      config: {
        systemInstruction: "You are a warm, supportive ecological lifestyle coach. Examine the current calculations and habits logs, outputting highly valuable concrete carbon diet advice and estimates in clean JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A highly motivating, human, concise 2-sentence feedback of user carbon status." },
            annualProjectedEmissions: { type: Type.NUMBER, description: "Estimation of user's annualized net emissions in kg CO2e." },
            grade: { type: Type.STRING, description: "Grade of carbon discipline: A+, A, B, C, D" },
            customTips: {
              type: Type.ARRAY,
              description: "3 highly tailored recommendations targeting their largest footprint sources.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short, punchy recommendation title." },
                  description: { type: Type.STRING, description: "Brief details outlining the action." },
                  potentialSavingsKg: { type: Type.NUMBER, description: "Estimated weekly kg CO2e saved." }
                },
                required: ["title", "description", "potentialSavingsKg"]
              }
            }
          },
          required: ["summary", "annualProjectedEmissions", "grade", "customTips"]
        }
      }
    });

    const textOutput = response.text?.trim() || "{}";
    const parsedData = JSON.parse(textOutput);
    res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini Coach Error:", err);
    res.status(500).json({ error: "Failed to generate personalized AI recommendations", details: err?.message || err });
  }
});

// Configure Vite middleware or production build files depending on mode
async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for development");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up Express static serve for production");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EcoTrace] Running on port http://localhost:${PORT}`);
  });
}

bootServer().catch((error) => {
  console.error("Failed to start full-stack server:", error);
});
