import { GoogleGenAI } from "@google/genai";
import { Equipment, Exercise } from "../types";

export class GeminiCoachService {
  private ai: GoogleGenAI;

  constructor() {
    // In a real app, do not hardcode, but for this demo environment we rely on env vars.
    // The instructions say use process.env.API_KEY.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Generates a substitute exercise based on available equipment.
   */
  async generateSubstitute(
    originalExercise: Exercise,
    availableEquipment: Equipment[]
  ): Promise<string> {
    if (!process.env.API_KEY) {
        return "API Key missing. Cannot generate substitute.";
    }

    const equipmentList = availableEquipment.map(e => e.name).join(", ");
    
    const prompt = `
      You are an expert biomechanics and fitness coach.
      
      Context:
      The user wants to perform: "${originalExercise.name}"
      Target Muscle: "${originalExercise.targetMuscle}"
      Required Equipment for original: ${originalExercise.requiredEquipment.join(", ")}
      
      Constraint:
      The user ONLY has the following equipment available: [${equipmentList}]
      
      Task:
      Recommend ONE biomechanically similar substitute exercise that can be performed with the available equipment.
      Explain briefly why it is a good substitute and how to perform it safely.
      Keep the response concise (under 100 words).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-latest', // High speed model for interactive UI
        contents: prompt,
      });
      return response.text || "No substitution found.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Sorry, I couldn't connect to the AI Coach right now.";
    }
  }
}

export const geminiService = new GeminiCoachService();