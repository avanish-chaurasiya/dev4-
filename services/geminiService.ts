import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to remove backticks from JSON strings if Gemini adds them (fallback)
const cleanJson = (text: string) => {
  return text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
};

/**
 * DEEPFAKE DETECTOR
 * Model: gemini-3-pro-preview
 * Reason: Complex image analysis and reasoning required with strict output schema.
 */
export const analyzeMediaForDeepfake = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<{
  percentAI: number;
  verdict: string;
  details: string;
}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this visual media (image or video frame) for forensic evidence of AI manipulation or deepfake generation.
            Look for inconsistencies in lighting, shadows, anatomical details (hands, eyes, teeth), and pixel-level artifacts.
            Provide a percentage likelihood of AI generation.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            percentAI: { 
              type: Type.INTEGER, 
              description: "Estimated percentage probability that the image is AI generated (0-100)" 
            },
            verdict: { 
              type: Type.STRING, 
              enum: ["LIKELY AUTHENTIC", "MIXED/SUSPICIOUS", "HIGHLY LIKELY AI GENERATED"],
              description: "Categorical verdict based on the score" 
            },
            details: { 
              type: Type.STRING, 
              description: "A concise forensic report paragraph detailing specific artifacts found or absence thereof." 
            }
          },
          required: ["percentAI", "verdict", "details"]
        }
      }
    });

    // With responseSchema, response.text is guaranteed to be valid JSON structure (mostly)
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error("Deepfake Analysis Error:", error);
    throw error;
  }
};

/**
 * JOB SCAM DETECTOR
 * Feature 1: Fast Check -> gemini-2.5-flash with Grounding
 * Feature 2: Deep Verification -> gemini-3-pro-preview with Thinking
 */
export const analyzeJobOffer = async (jobText: string, useDeepThinking: boolean = false): Promise<{
  verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'POTENTIAL_SCAM';
  evidence: string[];
  redFlags: string[];
  companyStatus: string;
}> => {
  try {
    if (useDeepThinking) {
      // Complex Analysis with Thinking and Strict Schema
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze this job offer text for scam indicators. Thoroughly reason about the compensation, language, and request patterns.
        
        Job Text: "${jobText}"`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }, 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, enum: ["LEGITIMATE", "SUSPICIOUS", "POTENTIAL_SCAM"] },
              evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              companyStatus: { type: Type.STRING, description: "Inferred status of the company entity based on text analysis" }
            },
            required: ["verdict", "evidence", "redFlags", "companyStatus"]
          }
        }
      });
      const text = response.text;
       if (!text) throw new Error("No response");
      return JSON.parse(cleanJson(text));

    } else {
      // Fast Check using Grounding (Gemini 2.5 Flash)
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Verify this job offer. Check if the company exists and if the offer details align with standard practices for that company.
        Job Text: "${jobText}"`,
        config: {
          tools: [{ googleSearch: {} }] // Use search to verify company
        }
      });
      
      const text = response.text || "";
      
      // Structure the unstructured grounded response using Flash-Lite with Schema
      const formattedResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `Extract the verdict and details from this analysis text into JSON.
        Analysis: "${text}"`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, enum: ["LEGITIMATE", "SUSPICIOUS", "POTENTIAL_SCAM"] },
              evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              companyStatus: { type: Type.STRING }
            },
            required: ["verdict", "evidence", "redFlags", "companyStatus"]
          }
        }
      });
      
      return JSON.parse(cleanJson(formattedResponse.text || "{}"));
    }
  } catch (error) {
    console.error("Job Analysis Error:", error);
    throw error;
  }
};

/**
 * NEWS VERACITY CHECK
 * Model: gemini-2.5-flash
 * Tool: googleSearch
 */
export const verifyNews = async (claim: string, imageBase64?: string): Promise<{
  verdict: 'REAL' | 'FAKE' | 'MISLEADING';
  correction: string;
  sources: { title: string; uri: string }[];
}> => {
  try {
    const parts: any[] = [{ text: `Verify this claim using Google Search. Determine if it is REAL, FAKE, or MISLEADING. 
    Claim: "${claim}"` }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const rawText = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract sources from grounding metadata
    const sources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri
      }));

    // Format verdict with Schema
    const formatter = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `Based on this verification text, extract the verdict and a factual summary/correction.
        Text: "${rawText}"`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, enum: ["REAL", "FAKE", "MISLEADING"] },
              correction: { type: Type.STRING, description: "A factual correction if fake, or summary if real." }
            },
            required: ["verdict", "correction"]
          }
        }
    });

    const parsed = JSON.parse(cleanJson(formatter.text || "{}"));

    return {
      verdict: parsed.verdict,
      correction: parsed.correction,
      sources: sources
    };

  } catch (error) {
    console.error("News Verify Error:", error);
    throw error;
  }
};

/**
 * CHAT ASSISTANT
 * Model: gemini-3-pro-preview
 */
export const sendChatMessage = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are Veritas AI, a helpful digital integrity assistant. Answer questions about deepfakes, scams, and misinformation."
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};