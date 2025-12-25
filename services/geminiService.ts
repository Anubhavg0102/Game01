import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found in environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAuntyCommentary = async (score: number, causeOfDeath: string): Promise<string> => {
  const client = getGeminiClient();
  if (!client) return "Check your internet connection to get the AI judge's score!";

  try {
    const prompt = `
      You are an energetic, slightly over-the-top video game commentator.
      The player (a brave cute girl) just finished a run in 'Dino Dash', fighting off dinosaurs in a city.
      
      Player Stats:
      - Score: ${score} (If > 1000, call them a Legend. If < 200, tell them the dinos ate their lunch).
      - Cause of defeat: ${causeOfDeath}.
      
      Give a short, punchy, 2-sentence commentary. Be encouraging but funny. 
      Use gaming slang like "GG", "Epic Fail", "Respawn", "Noob", "Pro Gamer".
      Don't use emojis in the text response.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "GG! Try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection lost! But your spirit remains!";
  }
};