import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body limit to handle base64 image uploads
app.use(express.json({ limit: "25mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Endpoint: AI-Powered Issue Detection
app.post("/api/gemini/analyze-issue", async (req, res) => {
  try {
    const { description, image, latitude, longitude } = req.body;

    const ai = getGeminiClient();

    let textPrompt = `Analyze this community infrastructure issue report. 
    ${description ? `Citizen description: "${description}"` : ""}
    ${latitude && longitude ? `Report coordinates: Latitude ${latitude}, Longitude ${longitude}` : ""}
    
    Please detect:
    1. The core category (like 'Pothole', 'Garbage Heap', 'Water Leakage', 'Broken Streetlight', 'Damaged Road', 'Public Hazard').
    2. Estimated municipal Ward (e.g. 'Ward 12', 'Ward 14', or guess a standard Ward based on location or description).
    3. The severity level (Low, Medium, High, Critical) based on potential danger or obstruction (e.g. water leakage near school zone is 'Critical', pothole on highways is 'High').
    4. Suggested nearest Landmark or area name.
    5. Estimated affected population size (integer).
    6. Safety risk assessment.
    7. Environmental risk assessment.
    8. Responsible municipal department (like 'Municipal Water Department', 'Roads & Highways Division', 'Sanitation & Waste Clean-up Board', 'Electrical Board').
    9. Action recommendation for quick resolution.
    10. AI Confidence Trust Score (integer between 60 and 99).`;

    const contents: any[] = [];

    if (image) {
      // image is a base64 string
      // base64 format check and cleanup
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    contents.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "One of Pothole, Garbage Pile, Water Leakage, Broken Streetlight, Damaged Road, Public Hazard" },
            severity: { type: Type.STRING, description: "One of Low, Medium, High, Critical" },
            landmark: { type: Type.STRING, description: "A suggested nearby landmark or address snippet" },
            ward: { type: Type.STRING, description: "A ward ID like Ward 12, Ward 14, Ward 7" },
            impactPopulation: { type: Type.INTEGER, description: "Estimated number of residents or travelers affected" },
            impactSafety: { type: Type.STRING, description: "One of Low, Medium, High, Critical" },
            impactEnvironment: { type: Type.STRING, description: "One of Low, Medium, High, Critical" },
            routingDepartment: { type: Type.STRING, description: "The specific local Department responsible for fixing this" },
            suggestedActions: { type: Type.STRING, description: "Specific remediation/repair recommendations" },
            trustScore: { type: Type.INTEGER, description: "AI Confidence rating from 60 to 99" },
            title: { type: Type.STRING, description: "A very brief, descriptive name for compiling this issue, e.g. Broken Water Main on Pine St" }
          },
          required: ["category", "severity", "landmark", "ward", "impactPopulation", "impactSafety", "impactEnvironment", "routingDepartment", "suggestedActions", "trustScore", "title"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const jsonResult = JSON.parse(resultText);
    res.json(jsonResult);
  } catch (err: any) {
    console.error("Error in analyze-issue:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Endpoint: AI-powered Predictive Hotspot Analysis
app.post("/api/gemini/analyze-hotspots", async (req, res) => {
  try {
    const { issues } = req.body;
    
    // Fallback if no issues are provided
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return res.json([
        { ward: "Ward 12", riskPercentage: 84, primaryIssueType: "Pothole", trend: "increasing", recommendation: "Schedule preventive patching on Main St near Savertha Zone.", lastAnalysedAt: new Date().toISOString() },
        { ward: "Ward 14", riskPercentage: 62, primaryIssueType: "Water Leakage", trend: "stable", recommendation: "Inspect elderly pipe joints near Saveetha Engineering campus.", lastAnalysedAt: new Date().toISOString() },
        { ward: "Ward 7", riskPercentage: 35, primaryIssueType: "Garbage Pile", trend: "decreasing", recommendation: "Increase bi-weekly sanitation pickup frequency to handle spillover.", lastAnalysedAt: new Date().toISOString() }
      ]);
    }

    const ai = getGeminiClient();

    const promptText = `Analyze the following infrastructure issue complaints to predict emerging hotspots and risk percentages for different municipal wards.
    
    COMPLAINTS:
    ${JSON.stringify(issues.map(i => ({ ward: i.ward, category: i.category, severity: i.severity, status: i.status })))}
    
    Return a list of ward analyses predicting risk probability (0-100), primary issue types, current direction trends, and preventive suggestions for other authorities.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ward: { type: Type.STRING },
              riskPercentage: { type: Type.INTEGER },
              primaryIssueType: { type: Type.STRING },
              trend: { type: Type.STRING, description: "increasing, stable, or decreasing" },
              recommendation: { type: Type.STRING, description: "Suggested proactive ward action" },
              lastAnalysedAt: { type: Type.STRING }
            },
            required: ["ward", "riskPercentage", "primaryIssueType", "trend", "recommendation"]
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from Gemini.");
    }

    const parsed = JSON.parse(resultText);
    const results = parsed.map((item: any) => ({
      ...item,
      lastAnalysedAt: new Date().toISOString()
    }));

    res.json(results);
  } catch (err: any) {
    console.error("Error analyzing hotspots:", err);
    res.status(500).json({ error: err.message || "Failed to analyze hotspots" });
  }
});

// Mounting Vite dev server or static middleware
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicPulse AI server running on port ${PORT}`);
  });
}

setupViteOrStatic();
