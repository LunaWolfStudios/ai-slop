import { GoogleGenAI } from "@google/genai";
import { ActivePet, PetState } from "../types";

const API_KEY = process.env.API_KEY || '';

let aiClient: GoogleGenAI | null = null;

if (API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: API_KEY });
}

export const generatePetThought = async (pet: ActivePet): Promise<string> => {
  if (!aiClient) {
    // Fallback if no API key is present
    if (pet.stats.hunger > 70) return "I'm so hungry...";
    if (pet.stats.energy < 30) return "So... sleepy...";
    if (pet.stats.happiness > 80) return "Best day ever!";
    return "What are we doing next?";
  }

  const prompt = `
    You are a virtual pet. 
    Species: ${pet.type}
    Personality: ${pet.personality}
    Name: ${pet.customName}
    Current State: ${pet.state}
    Stats: 
      Hunger: ${pet.stats.hunger}% (High is hungry)
      Energy: ${pet.stats.energy}%
      Happiness: ${pet.stats.happiness}%
      Affection: ${pet.stats.affection}%

    Write a very short, cute thought bubble text (max 10 words) representing your current mood. 
    Do not use quotes.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Woof?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "...";
  }
};
