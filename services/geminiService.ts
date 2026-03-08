

import { GoogleGenAI, Modality } from "@google/genai";

// Initialize API Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates text content (scripts, JSON data) using Gemini 3 Flash.
 * Used for generating Concepts and Shotlists.
 */
export const generateScriptContent = async (prompt: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let text = response.text;
        if (!text) return null;

        // Robust JSON extraction:
        // 1. Remove specific Markdown code block syntax (case insensitive)
        text = text.replace(/```json/gi, '').replace(/```/g, '');
        
        // 2. Find the valid JSON object/array substring
        const firstOpenBrace = text.indexOf('{');
        const firstOpenBracket = text.indexOf('[');
        let startIndex = -1;
        
        // Determine if it starts with { or [
        if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
            startIndex = firstOpenBrace;
        } else if (firstOpenBracket !== -1) {
            startIndex = firstOpenBracket;
        }

        if (startIndex !== -1) {
            // Determine end based on start type
            let endIndex = -1;
            if (startIndex === firstOpenBrace) {
                 endIndex = text.lastIndexOf('}');
            } else {
                 endIndex = text.lastIndexOf(']');
            }

            if (endIndex !== -1 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }
        }

        // 3. Remove trailing commas which often cause "Expected double-quoted property name"
        // This finds a comma followed by whitespace (optional) and then a closing brace or bracket
        text = text.replace(/,(\s*[}\]])/g, '$1');

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error after cleaning:", e);
            console.log("Cleaned text:", text);
            return null;
        }
    } catch (error) {
        console.error("Gemini Script Gen Error:", error);
        return null; 
    }
};

/**
 * Generates an image using Gemini 2.5 Flash Image.
 * Supports text prompts and optional reference images.
 * Implements aggressive exponential backoff for 429 Rate Limit errors.
 */
export const generateStoryboardImage = async (
  prompt: string,
  referenceImages: string[] = [],
  aspectRatio: "16:9" | "9:16" = "16:9",
  retries = 5
): Promise<string | null> => {
  const parts: any[] = [{ text: prompt }];

  // Add reference images if provided
  for (const ref of referenceImages) {
    // Check if it's a data URI
    const match = ref.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio
          }
        },
      });

      // Extract the image from the response
      const content = response.candidates?.[0]?.content;
      if (content?.parts) {
          for (const part of content.parts) {
              if (part.inlineData && part.inlineData.data) {
                  return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              }
          }
      }
      return null;

    } catch (error: any) {
      // Check for 429 Resource Exhausted / Rate Limit
      const errString = JSON.stringify(error);
      const isRateLimit = 
        errString.includes('429') || 
        errString.includes('RESOURCE_EXHAUSTED') || 
        error?.status === 429 || 
        error?.error?.code === 429;
      
      if (isRateLimit) {
        if (attempt < retries) {
            // Backoff: 5s, 10s, 20s, 40s, 80s
            const delay = Math.pow(2, attempt) * 5000; 
            console.warn(`Gemini 429 Quota Exceeded. Retrying in ${delay/1000}s... (Attempt ${attempt + 1}/${retries})`);
            await sleep(delay);
            attempt++;
            continue;
        } else {
            console.error("Gemini Image Gen: Quota Exceeded after max retries.");
            return null; // Return null gracefully
        }
      }
      
      console.error("Gemini Image Gen Error:", error);
      return null;
    }
  }
  return null;
};

/**
 * Generates speech (TTS) from text using Gemini 2.5 Flash TTS.
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Return raw base64 PCM data. 
      // Note: Gemini returns raw PCM 24kHz (usually). 
      // It is NOT MP3. Adding data URI prefix for MP3 causes decoding errors.
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
