
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSimpleGame = async (prompt: string): Promise<{ htmlContent: string, title: string, description: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a single-file, production-ready HTML5 arcade game based on this idea: "${prompt}". 

    STRICT REQUIREMENTS:
    1. COMPLETE DOCUMENT: The response must be a valid HTML5 document starting with <!DOCTYPE html>.
    2. SELF-CONTAINED: All CSS and JavaScript MUST be inline within <style> and <script> tags.
    3. NO EXTERNAL ASSETS: Do not use external images or sounds. Use HTML5 Canvas API or CSS for all graphics/animations. 
    4. PLAYABILITY: The game must be immediately playable. Include a 'Start' button and a 'Game Over' screen with a 'Restart' option.
    5. SCORING: Use window.parent.postMessage({ type: 'SCORE_UPDATE', score: currentScore }, '*') to send the score to the platform whenever it changes.
    6. CONTROLS: Ensure the game listens for common inputs (Arrow keys, WASD, Space, or Mouse/Touch).
    7. RESPONSIVE: The game should occupy 100% of the viewport width and height. Use: body { margin: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; }
    
    Return the response as a JSON object with fields: "title", "description", and "htmlContent".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          htmlContent: { type: Type.STRING }
        },
        required: ["title", "description", "htmlContent"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned an empty response.");
  return JSON.parse(text.trim());
};

export const curateGameDescription = async (htmlCode: string): Promise<{ title: string, description: string, category: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this HTML game code and provide a catchy title, a short description (1-2 sentences), and a category (Action, Puzzle, Arcade, Racing, Strategy).
    
    Code Snippet:
    ${htmlCode.substring(0, 5000)}
    
    Return the response as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["title", "description", "category"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned an empty response.");
  return JSON.parse(text.trim());
};
