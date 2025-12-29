
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client strictly using process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAcademicAdvice = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are an AI Education Assistant for eSchool. Provide brief, helpful, and professional advice for teachers and administrators about school management, student performance, or educational strategies.",
        temperature: 0.7,
      },
    });
    // Correctly extracting text using the .text property from GenerateContentResponse.
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to the AI assistant right now.";
  }
};
