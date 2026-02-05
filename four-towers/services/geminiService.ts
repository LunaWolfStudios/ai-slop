import { GoogleGenAI } from "@google/genai";
import { GameState, Player } from "../types";

// Safe initialization that doesn't crash if key is missing (handled in UI)
const getAI = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getNerdstormTaunt = async (player: Player, gameState: GameState, context: 'DEATH' | 'NEW_FLOOR' | 'IDLE'): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Nerdstorm laughs at your lack of an API Key! (Configure process.env.API_KEY)";

  const hpPercent = Math.round((player.health / player.maxHealth) * 100);
  const floor = gameState.floor;
  
  let prompt = "";
  
  if (context === 'DEATH') {
    prompt = `You are Lord Nerdstorm, an evil tech-wizard. The player just died on floor ${floor}. 
    They were using the ${player.element} element. Mock them ruthlessly but keep it under 2 sentences. Be funny and condescending.`;
  } else if (context === 'NEW_FLOOR') {
    prompt = `You are Lord Nerdstorm. The player just reached floor ${floor}. 
    They have ${hpPercent}% health remaining. Give them a backhanded compliment or a warning about the procedural horrors ahead. Max 2 sentences.`;
  } else {
    prompt = `You are Lord Nerdstorm. The player is idling. Mock their hesitation. Max 1 sentence.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Nerdstorm is speechless...";
  } catch (error) {
    console.error("Gemini API Error", error);
    return "Nerdstorm's communication crystals are jammed...";
  }
};