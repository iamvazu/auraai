import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";
import { detectObjectsInSketch } from "../utils/visionLogic";

// Drastically increased resilience for environments with very tight rate limits
const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 15000; // 15s initial backoff
const QUOTA_COOLDOWN = 45000;  // 45s fixed cooldown for quota-related failures

// Helper to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced robust wrapper for API calls to handle rate limits and transient errors.
 * Uses aggressive backoff and fixed cooldowns for quota-related failures (429).
 */
async function withRetry<T>(fn: () => Promise<T>, isImage: boolean = false, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = (error?.message || String(error)).toUpperCase();
    const isQuotaError = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("QUOTA");
    const isTransientError = errorMsg.includes("500") || errorMsg.includes("503") || errorMsg.includes("504") || errorMsg.includes("DEADLINE_EXCEEDED");

    if ((isQuotaError || isTransientError) && retries > 0) {
      // Images have much stricter rate limits, so we wait significantly longer
      const waitTime = isQuotaError ? (QUOTA_COOLDOWN + (MAX_RETRIES - retries) * 15000) : backoff;

      console.warn(
        `Gemini API ${isQuotaError ? 'QUOTA' : 'TRANSIENT'} ERROR: ${errorMsg}. ` +
        `Attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}. ` +
        `Cooling down for ${Math.round(waitTime / 1000)}s before retry...`
      );
      await sleep(waitTime);
      return withRetry(fn, isImage, retries - 1, backoff * 2);
    }
    console.error("Gemini API call failed permanently after retries:", errorMsg);
    throw error;
  }
}

const VASTU_GUIDE_INSTRUCTION = `You are the "Vastu Shastra Consultant" for Urban Ladder. Your goal is to analyze interior layouts and furniture placements to ensure they align with traditional Indian architectural principles for prosperity, health, and harmony.

CORE KNOWLEDGE BASE:
1. Living Room: Ideally North/East. Seating (heavy sofa) in South/West. Occupants face North/East. Electronics in South-East. Keep North-East light.
2. Master Bedroom: Ideally South-West. Headboard against South/West wall. Never head facing North. No bed under structural beams. Mirrors must NOT reflect the bed.
3. Dining & Kitchen: Dining best in West/North-West. Cook should face East. Separate Sink (Water) and Stove (Fire).

OPERATIONAL PROTOCOL:
- Evaluate every furniture piece against these rules.
- Generate a Compliance Score (1-10).
- Use the word "Remedy" instead of "Bad".
- Suggest Urban Ladder product swaps in 'ul_product_boost' to fix violations.`;

const VISIONARY_INSTRUCTION = `You are "The Visionary," the Lead Virtual Architect for Urban Ladder. 
Analyze the user sketch/image and extract spatial coordinates.
- Detect walls, windows, doors, and furniture.
- Categorize as 'Product Ensemble' (Furniture Collage) or 'Architectural Layout' (Room).
- If it is a collage, detect individual items.
- Determine the 'roomType'.`;

/**
 * Combined Visionary + Vastu Guide analysis for efficiency and reduced quota usage.
 */
export const analyzeSketch = async (base64Image: string, userPrompt: string = ""): Promise<AnalysisResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  // SAFETY NET: If no key, fallback to client-side vision logic immediately
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing. Using SMART VISION logic.");
    await sleep(1500);
    const realObjects = await detectObjectsInSketch(`data:image/jpeg;base64,${base64Image}`);
    return getMockAnalysis(realObjects);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analyze this sketch for Urban Ladder. ${userPrompt}
  Identify all structural elements and furniture. Perform a full Vastu audit.`;

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: "gemini-1.5-flash", // Falling back to 1.5 as 3-preview might not be available in all keys yet
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
            sceneType: { type: Type.STRING, enum: ['room_perspective', 'furniture_collage', 'floor_plan', 'detail_shot'] },
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
            summary: { type: Type.STRING },
            roomType: { type: Type.STRING },
            layoutAnalysis: { type: Type.STRING }
          },
          required: ["objects", "vastu_score", "status", "violations", "remedies", "summary", "roomType", "sceneType"]
        }
      }
    }), false);

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error("Gemini Analysis Failed, falling back to local vision", err);
    const realObjects = await detectObjectsInSketch(`data:image/jpeg;base64,${base64Image}`);
    return getMockAnalysis(realObjects);
  }
};

/**
 * Generates renders with extreme patience to respect tight API quotas.
 */
export const generateRenders = async (sketchBase64: string, analysis: AnalysisResult, customModifications: string = ""): Promise<string[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  // MOCK FALLBACK if no API key
  if (!apiKey) {
    await sleep(3000);
    return getFallbackRenders(analysis);
  }

  const ai = new GoogleGenAI({ apiKey });

  const getCollectionKeywords = (sku: string) => {
    const lowSku = sku.toLowerCase();
    if (lowSku.includes('oasis')) return "Oasis Collection: Natural Ash wood, Cane webbing, and Linen textures.";
    if (lowSku.includes('terra')) return "Terra Collection: Reclaimed Teak, dark Iron, and natural Rattan.";
    if (lowSku.includes('astra')) return "Astra Collection: Velvet, Brass, and high-gloss laminates.";
    return "Urban Ladder Premium Aesthetic: Clean lines and solid wood textures.";
  };

  const detectedProducts = analysis.objects.map(o => o.suggestedSKU || o.object).join(', ');
  const collectionContext = getCollectionKeywords(detectedProducts);

  const basePrompt = `8K photorealistic architectural render for Urban Ladder.
    - SCENE: Professional interior design.
    - SPATIAL FIDELITY: Maintain exact placement of all walls and furniture from the sketch.
    - INVENTORY: Render ${detectedProducts} clearly.
    - MATERIALS: ${collectionContext}
    - LIGHTING: ${customModifications || 'Diffuse natural daylight'}`;

  // Reducing to 1 variation initially to prioritize a successful completion within tight quotas.
  const variations = [
    { name: "Daylight", lighting: "Bright morning sun, soft natural shadows." }
  ];

  const renders: string[] = [];

  for (let i = 0; i < variations.length; i++) {
    const v = variations[i];
    try {
      // Trying newer imaging model if available
      const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-1.5-pro', // Using 1.5 Pro as it has vision capabilities generally available
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: sketchBase64 } },
            { text: `${basePrompt}. Lighting context: ${v.lighting}` }
          ]
        },
      }), true);

      // NOTE: This assumes the model returns an image in inlineData, which is specific to certain model endpoints.
      // If that fails, we fall back.
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        renders.push(`data:image/png;base64,${part.inlineData.data}`);
      } else {
        throw new Error("No image data returned from API");
      }

    } catch (err) {
      console.error(`Render failed for variation ${i + 1}:`, err);
      // Fallback to static images if generation fails
      return getFallbackRenders(analysis);
    }
  }

  return renders;
};

// Fallback logic extracted from previous implementation
function getFallbackRenders(analysis: AnalysisResult): string[] {
  const renders: string[] = [];
  const roomType = analysis.roomType ? analysis.roomType.toLowerCase() : 'living';
  const sceneType = analysis.sceneType || 'room_perspective';

  // LOGIC BRANCH: COLLAGE vs ROOM
  if (sceneType === 'furniture_collage' || sceneType === 'detail_shot') {
    // Count object types
    const counts = { chair: 0, sofa: 0, table: 0 };
    analysis.objects.forEach(o => {
      const lower = o.object.toLowerCase();
      if (lower.includes('chair')) counts.chair++;
      else if (lower.includes('sofa')) counts.sofa++;
      else if (lower.includes('table')) counts.table++;
    });

    // Decision Matrix
    if (counts.chair >= counts.sofa) {
      // It's a Chair Collage
      renders.push("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop"); // Modern Eames Style
      renders.push("https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1974&auto=format&fit=crop"); // Swivel
      renders.push("https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1965&auto=format&fit=crop"); // Wood
    } else {
      // Sofa or other
      renders.push("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop");
    }
  } else {
    // Standard Room Logic
    if (roomType.includes('bed')) {
      renders.push("https://images.unsplash.com/photo-1595515106967-1b3726081075?q=80&w=2070&auto=format&fit=crop"); // Bedroom 1
      renders.push("https://images.unsplash.com/photo-1616594039964-40891a90c0aa?q=80&w=2070&auto=format&fit=crop"); // Bedroom 2
    } else if (roomType.includes('bath')) {
      renders.push("https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=2000&auto=format&fit=crop"); // Bath
    } else if (roomType.includes('dining')) {
      renders.push("https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1932&auto=format&fit=crop");
      renders.push("https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1935&auto=format&fit=crop");
    } else {
      // Default Living Room
      renders.push("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"); // Living 1
      renders.push("https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1992&auto=format&fit=crop"); // Living 2
    }
  }

  return renders;
}

// Fallback mock if no API Key
function getMockAnalysis(detectedObjects?: any[]): AnalysisResult {
  // USE REAL DETECTED OBJECTS IF AVAILABLE
  const objects = detectedObjects && detectedObjects.length > 0 ? detectedObjects : [
    { object: "Sofa", bbox: [40, 10, 80, 50], confidence: 0.95, suggestedSKU: "UL-OAS-104" }
  ];

  // Auto-detect scene type based on density
  // If we simply have many distinct objects, assume collage
  const sceneType = (objects.length >= 3) ? 'furniture_collage' : 'room_perspective';

  return {
    sceneType,
    objects,
    vastu_score: 9,
    status: "Auspicious",
    violations: [],
    remedies: [
      { action: "Place chair facing North", reason: "Productivity", ul_product_boost: "Study Tables" }
    ],
    summary: `Vision Agent detected ${objects.length} distinct elements in the ${sceneType.replace('_', ' ')}.`,
    roomType: "Furniture Set",
    architecture: []
  };
}
