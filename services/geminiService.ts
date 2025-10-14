
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedToolDetails, Tool } from '../types';

// Lazily initialize the AI client to avoid crashing on load
// if process.env.API_KEY is not available in the environment.
let ai: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        // This will throw an error only when an API call is made,
        // allowing the rest of the app to function.
        // @ts-ignore
        if (typeof process === 'undefined' || !process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        // @ts-ignore
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};


export const generateToolDetails = async (tool: Tool): Promise<{ data: GeneratedToolDetails | null; error: string | null }> => {
  let prompt = `
    For the cybersecurity tool named "${tool.name}", which is described as "${tool.description}", provide the following information:

    1. A common, practical command-line example of how to use this tool. Use placeholder values like <target_ip> or <domain.com>.
    2. A concise, educational explanation (2-4 sentences) of how this tool can be used for exploitation or in a penetration testing scenario.
  `;

  if (tool.tags && tool.tags.length > 0) {
    prompt += `\n\nThis tool is commonly used for these tasks: ${tool.tags.join(', ')}. Focus the example and use case on these tasks.`;
  }

  try {
    const aiClient = getAiClient(); // Get the initialized client
    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    command: {
                        type: Type.STRING,
                        description: 'A common, practical command-line example of how to use this tool.'
                    },
                    exploit: {
                        type: Type.STRING,
                        description: 'A concise, educational explanation of how this tool can be used for exploitation or in a penetration testing scenario.'
                    }
                },
                required: ['command', 'exploit']
            },
        },
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed && typeof parsed.command === 'string' && typeof parsed.exploit === 'string') {
        return { data: parsed as GeneratedToolDetails, error: null };
    }

    console.error('Parsed JSON does not match expected format:', parsed);
    return { data: null, error: 'Failed to get details from the AI. The response was invalid.' };
    
  } catch (error) {
    console.error("Error generating tool details:", error);
    let errorMessage = "An unknown error occurred while fetching details from the AI.";
    if (error instanceof Error) {
        if (error.message.includes("API_KEY")) {
             errorMessage = "The AI functionality is not configured. The API key is missing from your hosting environment.";
        } else if (error.message.includes('429')) {
            errorMessage = "You've made too many requests in a short period. Please wait a moment and try again.";
        } else {
             errorMessage = `An API error occurred: ${error.message}`;
        }
    }
    return { data: null, error: errorMessage };
  }
};