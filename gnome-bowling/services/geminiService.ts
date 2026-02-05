import { GoogleGenAI } from "@google/genai";
import { CommentaryType } from '../types';

let genAI: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini API", e);
}

export const getGnomeCommentary = async (type: CommentaryType, score?: number): Promise<string> => {
  if (!genAI) {
    return getFallbackCommentary(type);
  }

  const prompt = `
    You are a grumpy, cynical, but secretly funny garden gnome. 
    You are currently standing on a bowling lane, and a giant mushroom (the ball) is being rolled at you.
    Provide a short, punchy, funny reaction to the following event: ${type}.
    
    Context:
    - If STRIKE: You are in pain or shocked that everyone fell.
    - If SPARE: Reluctant respect.
    - If GUTTER: Mock the player heavily.
    - If MISS: Laugh at the player's aim.
    - If GAME_START: Warn the player to stay off the lawn.
    - If GAME_OVER: Summarize the player's performance based on score: ${score}.
    
    Constraints:
    - Max 15 words.
    - No hashtags.
    - Be witty.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed
      }
    });
    return response.text || getFallbackCommentary(type);
  } catch (error) {
    console.error("Gemini API error:", error);
    return getFallbackCommentary(type);
  }
};

const getFallbackCommentary = (type: CommentaryType): string => {
  switch (type) {
    case 'STRIKE': return "Ouch! That mushroom heavy!";
    case 'SPARE': return "Clean up on aisle 4!";
    case 'GUTTER': return "My grandma bowls better!";
    case 'MISS': return "Missed me by a mile!";
    case 'GAME_START': return "Get off my lawn!";
    case 'GAME_OVER': return "Game over, man! Game over!";
    default: return "Hmmpf.";
  }
};