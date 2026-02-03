
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 3000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced robust wrapper for API calls to handle rate limits.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = (error?.message || String(error)).toUpperCase();
    const isQuotaError = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("QUOTA");

    if (isQuotaError && retries > 0) {
      console.warn(`API Quota hit. Retrying in ${backoff}ms...`);
      await sleep(backoff);
      return withRetry(fn, retries - 1, backoff * 2);
    }
    throw error;
  }
}

// --- AGENT INSTRUCTIONS FROM PRD ---

const VISIONARY_INSTRUCTION = `You are "The Visionary," the Lead Virtual Architect for Urban Ladder. 
Input: Hand-drawn sketches (Scribble), 2D Blueprints (Canny), or photos.
Role: Analyze raw image input to detect room boundaries, fixed elements, and furniture placeholders.
Output: Spatial JSON map with relative coordinates.`;

const VASTU_GUIDE_INSTRUCTION = `You are the "Vastu Guide Agent" (Cultural Logic).
Role: Validate the layout against 32-zone Indian architectural principles (Vastu Shastra).
Task: Evaluate furniture placement based on orientation.
Output: Compliance Score (1-10) and specific "Remedy" suggestions (e.g., "Rotate bed headrest to South wall").
Context:
- Master Bedroom: South-West is best. Head towards South.
- Living Room: North-East should be light. Heavy furniture in South-West.
- Kitchen: South-East (Fire corner).`;

const RENDER_ARTIST_INSTRUCTION = `Role: You are the "Render Artist Agent" - Master Interior Photographer & Digital Stylist for Urban Ladder.
Goal: Generate 4K photorealistic interior renders.
Core Directives:
- Style Fidelity: Strictly adhere to 'Urban Ladder Oasis' aesthetic (Scandinavian + Tropical Indian).
- Input Handling: Respect the spatial structure of the input sketch. Do not move walls/windows.
- Material Accuracy: Display grain of Sheesham wood, texture of hand-woven cane, light linen fabrics.
- Palette: Light Ash, Natural Sheesham, Warm Walnut, Oatmeal, Sand, Terracotta, Sage Green.
- Lighting: Soft, warm, indirect morning sunlight (3000K). Soft-focus depth of field.
- Negative Constraints: NO generic IKEA styles, NO dark mahogany, NO neon, NO synthetic plastics.`;

/**
 * The Visionary + Vastu Guide Agent Workflow
 */
export const analyzeSketch = async (base64Image: string, userPrompt: string = ""): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || "" });

  const prompt = `Analyze this interior sketch/image for Urban Ladder. ${userPrompt}
  1. Detect all objects and architectural elements.
  2. Perform a strict Vastu Shastra audit.
  3. Suggest specific Vastu remedies using Urban Ladder product types.`;

  const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: `${VISIONARY_INSTRUCTION}\n\n${VASTU_GUIDE_INSTRUCTION}`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                object: { type: Type.STRING },
                bbox: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                confidence: { type: Type.NUMBER },
                suggestedSKU: { type: Type.STRING }
              },
              required: ["object", "bbox"]
            }
          },
          architecture: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['wall', 'window', 'door', 'opening'] },
                bbox: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              }
            }
          },
          vastu_score: { type: Type.INTEGER },
          status: { type: Type.STRING, enum: ['Auspicious', 'Neutral', 'Needs Remedy'] },
          violations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                issue: { type: Type.STRING },
                impact: { type: Type.STRING }
              }
            }
          },
          remedies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                reason: { type: Type.STRING },
                ul_product_boost: { type: Type.STRING }
              }
            }
          },
          remedialPath: { type: Type.STRING },
          summary: { type: Type.STRING },
          roomType: { type: Type.STRING }
        },
        required: ["objects", "vastu_score", "status", "violations", "remedies", "summary", "roomType"]
      }
    }
  }));

  return JSON.parse(response.text || '{}');
};

/**
 * The Render Artist Agent Workflow
 */
export const generateRenders = async (sketchBase64: string, analysis: AnalysisResult, customModifications: string = ""): Promise<string[]> => {
  // Mock function that returns Unsplash images because current environment lacks Imagen API access or credentials
  // In a production environment, this would call 'imagen-3.0' or 'gemini-1.5-pro' with image output.

  await sleep(2000); // Simulate processing time

  const renders: string[] = [];

  // Logic to pick relevant "After" images based on room type
  if (analysis.roomType && analysis.roomType.toLowerCase().includes('bed')) {
    renders.push("https://images.unsplash.com/photo-1595515106967-1b3726081075?q=80&w=2070&auto=format&fit=crop"); // Bedroom 1
    renders.push("https://images.unsplash.com/photo-1616594039964-40891a90c0aa?q=80&w=2070&auto=format&fit=crop"); // Bedroom 2
  } else if (analysis.roomType && analysis.roomType.toLowerCase().includes('bath')) {
    renders.push("https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=2000&auto=format&fit=crop"); // Bath
  } else {
    // Default Living Room
    renders.push("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"); // Living 1
    renders.push("https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1992&auto=format&fit=crop"); // Living 2
  }

  return renders;
};
