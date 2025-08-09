import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw Error("Gemini API key is missing");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// This will store all conversation turns
let conversationHistory: { role: "user" | "model"; parts: { text: string }[] }[] = [];

// Make a request keeping context
export const makeRequest = async (
  systemPrompt: string = "You are a helpful assistant.",
  prompt: string
): Promise<string | undefined> => {
  try {
    // If history is empty, insert system prompt as the first turn
    if (conversationHistory.length === 0) {
      conversationHistory.push({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
    }

    // Add new user message to history
    conversationHistory.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    // Send entire conversation to Gemini
    const result = await model.generateContent({
      contents: conversationHistory,
    });

    const response = result.response;
    const text = await response.text();

    // Save AI reply into history
    conversationHistory.push({
      role: "model",
      parts: [{ text }],
    });

    return text;
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
