
import { GoogleGenAI } from "@google/genai";

export const getAcademicAdvice = async (query: string) => {
  try {
    // Fix: Initializing GoogleGenAI instance inside the function to ensure the latest API key is used per coding guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are an AI Education Assistant for eSchool. Provide brief, helpful, and professional advice for teachers and administrators about school management, student performance, or educational strategies.",
        temperature: 0.7,
      },
    });

    if (!response || !response.text) {
      console.warn("Gemini API returned an empty or malformed response.");
      return "I was unable to analyze that data. Please try again with more context.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Fatal Error:", error);
    if (error.status === 429) {
      return "The AI engine is currently reaching capacity. Please wait a few moments and try again.";
    }
    return "I'm sorry, I encountered a technical issue while processing your request.";
  }
};
