
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AdventureSegment {
  narrative: string;
  clankAction: string;
  choices: { text: string; nextMood: string }[];
}

export async function generateAdventureSegment(
  locationName: string,
  locationType: string,
  clankMood: string,
  progress: number,
  previousAction?: string
): Promise<AdventureSegment> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a master storyteller for a cozy text adventure called "Walkies".
      The player Jeremy is walking his dog Clank in ${locationName} (${locationType}).
      Clank is currently ${clankMood}. Progress: ${progress}%.
      ${previousAction ? `The player just chose to: ${previousAction}` : "They are just starting their walk."}

      Task:
      1. Write a 3-4 sentence beautiful, sensory-rich narrative of what they see and feel.
      2. Describe a small, cute action Clank takes.
      3. Provide 3 gentle choices for where to walk or what to do next.

      Tone: Gentle, safe, soft, warm, observant.
      Important: No danger, no violence. Just the joy of a walk.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING, description: "Sensory description of the current moment." },
            clankAction: { type: Type.STRING, description: "Clank's current behavior or reaction." },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Action text for the choice." },
                  nextMood: { type: Type.STRING, description: "One of: excited, chill, sniffing, tired, barking." }
                },
                required: ["text", "nextMood"]
              }
            }
          },
          required: ["narrative", "clankAction", "choices"]
        }
      }
    });

    // Ensure we handle potentially undefined response.text safely before parsing
    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      narrative: "The sun filters through the trees, casting long shadows across the path. The air is cool and smells of damp earth and pine.",
      clankAction: "Clank wags his tail softly, leaning against your leg.",
      choices: [
        { text: "Follow the winding path ahead", nextMood: "excited" },
        { text: "Stop to look at a cluster of wildflowers", nextMood: "sniffing" },
        { text: "Rest on a nearby stone wall", nextMood: "chill" }
      ]
    };
  }
}

/**
 * Generates a short, single-sentence narrative snippet for the 3D world view.
 * Fixes: Added missing export for World component.
 */
export async function generateWalkMoment(
  locationName: string,
  locationType: string,
  clankMood: string,
  progress: number
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jeremy and his dog Clank are walking in ${locationName} (${locationType}). 
      Clank is currently ${clankMood}. They have completed ${Math.round(progress)}% of their walk.
      Write a single, short, beautiful sensory sentence describing a small detail of this moment.`,
    });
    return response.text || "The world is quiet and full of soft wonders today.";
  } catch (error) {
    console.error("Gemini Error in generateWalkMoment:", error);
    return "The rhythmic sound of walking together fills the air.";
  }
}
