import Redis from "ioredis";
import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from "@google/generative-ai";


interface ConversationPart {
  text: string;
}

interface ConversationTurn {
  role: "user" | "model";
  parts: ConversationPart[];
}


const redis = new Redis(process.env.REDIS_URL as string);

async function getHistory(userId: string): Promise<ConversationTurn[]> {
  const data = await redis.get(`chat:${userId}`);
  return data ? JSON.parse(data) : [];
}

async function saveHistory(userId: string, history: ConversationTurn[]) {
  await redis.set(`chat:${userId}`, JSON.stringify(history), "EX", 60 * 30); 
}



const apiKey: string | undefined = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is missing");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
});

// ---------- Main Request Function ----------
export const makeRequest = async (
  userId: string,
  systemPrompt: string = "You are a helpful assistant for Dezy Clinic. Answer only in-scope queries about treatments, doctors, and appointments.",
  prompt: string
): Promise<string | undefined> => {
  try {
    // 1. Fetch user conversation history from Redis
    const history = await getHistory(userId);
  
    

    // 2. If it's a new conversation, start with system prompt
    if (history.length === 0) {
      history.push({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
    }

    // 3. Add user's message
    history.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    // 4. Send entire history to Gemini
    const result: GenerateContentResult = await model.generateContent({
      contents: history,
    });

    const text: string = await result.response.text();

    // 5. Save AI's reply to history
    history.push({
      role: "model",
      parts: [{ text }],
    });

    // 6. Save updated history back to Redis
    await saveHistory(userId, history);

    return text;
  } catch (error) {
    console.error("❌ Error:", error);
    return undefined;
  }
};
