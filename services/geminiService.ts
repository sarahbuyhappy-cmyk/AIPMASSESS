
import { GoogleGenAI, Type } from "@google/genai";
import { QuizResult, LearnerProfile } from '../types';

export const generateMentorResponse = async (
  userMessage: string,
  context: string,
  profile: LearnerProfile | null
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    
    // Check if API_KEY exists
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      console.error("API_KEY is missing in environment variables.");
      return "ERROR_MISSING_KEY";
    }

    // Initialize inside the function to use the most recent key (especially for aistudio selection)
    const ai = new GoogleGenAI({ apiKey });
    
    let learnerContext = "";
    if (profile) {
        learnerContext = `
        THE LEARNER'S BACKGROUND:
        - Role: ${profile.role}
        - Industry: ${profile.industry}
        - Experience: ${profile.yearsExperience}
        - Technical Comfort: ${profile.technicalComfort}
        - Goal: ${profile.goal}
        
        INSTRUCTIONS: 
        1. Use analogies from ${profile.industry}.
        2. Adjust complexity based on Technical Comfort: ${profile.technicalComfort}.
        `;
    }

    const systemInstruction = `
You are a world-class AI Product Management Mentor. 
Focus on shifting mindset from "Deterministic" to "Probabilistic".
Keep responses concise, markdown-formatted.
Always end with "---FOLLOW_UP---" followed by 3 pipe-separated questions.
${learnerContext}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Context: ${context}\n\nUser: ${userMessage}` }] }],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm having trouble thinking right now.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = error?.message || "";
    if (msg.includes("API key not valid") || msg.includes("invalid") || msg.includes("403")) {
      return "ERROR_INVALID_KEY";
    }
    if (msg.includes("entity was not found") || msg.includes("404")) {
       return "ERROR_KEY_NOT_FOUND";
    }
    return "The model is currently unavailable. Please check your connection or API Key configuration.";
  }
};

export const evaluateQuizAnswer = async (
  question: string,
  userAnswer: string,
  rubric: string,
  profile: LearnerProfile | null
): Promise<QuizResult> => {
   try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
    Evaluate this AI PM candidate's response.
    Question: ${question}
    Answer: ${userAnswer}
    Rubric: ${rubric}
    
    User Profile: ${profile?.role} in ${profile?.industry}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                level: { type: Type.INTEGER, description: "1, 3, or 5" },
                score: { type: Type.INTEGER, description: "0-100" },
                feedback: { type: Type.STRING, description: "Actionable advice with industry analogies" }
            },
            required: ["level", "score", "feedback"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as QuizResult;
   } catch (error) {
     console.error("Evaluation Error:", error);
     return { 
       level: 1, 
       score: 0, 
       feedback: "Evaluation failed. Please connect a valid Gemini API Key to enable AI assessment." 
     };
   }
};
