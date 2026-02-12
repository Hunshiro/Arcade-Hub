import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment.");
}

const ai = new GoogleGenAI({ apiKey });

export const generateSimpleGame = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
          htmlContent: { type: Type.STRING },
        },
        required: ["title", "description", "htmlContent"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("AI returned an empty response.");
  return JSON.parse(text.trim());
};
