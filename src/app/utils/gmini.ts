import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from "@google/generative-ai";

interface ConversationPart {
  text: string;
}

interface ConversationTurn {
  role: "user" | "model";
  parts: ConversationPart[];
}

const apiKey: string | undefined = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is missing");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Store conversation turns
const conversationHistory: ConversationTurn[] = [];

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
    const result: GenerateContentResult = await model.generateContent({
      contents: conversationHistory,
    });

    const text: string = await result.response.text();

    // Save AI reply into history
    conversationHistory.push({
      role: "model",
      parts: [{ text }],
    });

    return text;
  } catch (error) {
    console.error("❌ Error:", error);
    return undefined;
  }
};
