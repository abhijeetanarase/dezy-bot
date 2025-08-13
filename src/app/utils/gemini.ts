import Redis from "ioredis";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { time } from "console";

const redis = new Redis(process.env.REDIS_URL as string);

const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("Gemini API key is missing");

const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey,
});


async function getHistory(userId: string): Promise<BaseMessage[]> {
  const data = await redis.get(`chat:${userId}`);
  if (!data) return [];

  const rawHistory: { role: string; text: string }[] = JSON.parse(data);

  return rawHistory.map(({ role, text }) => {
    if (role === "user") return new HumanMessage(text);
    if (role === "model") return new AIMessage(text);
    return new HumanMessage(text);
  });
}


async function saveHistory(userId: string, messages: BaseMessage[]) {
  const simplified = messages.map(m => ({
    role: m.getType(), 
    text: m.text,
  }));
  await redis.set(`chat:${userId}`, JSON.stringify(simplified), "EX", 60 * 30);
}

export const makeRequest = async (
  userId: string,
  systemPrompt: string = "You are a helpful assistant for Dezy Clinic. Answer only in-scope queries about treatments, doctors, and appointments.",
  prompt: string
): Promise<string | undefined> => {
  try {
    let history = await getHistory(userId);
    history.push(new HumanMessage(prompt));
    const trimmedHistory  = [];
    trimmedHistory.push(new SystemMessage(systemPrompt));
    trimmedHistory.push(...history.slice(-10));
    
    
    const response = await chatModel.invoke(trimmedHistory);
    const responseText = response.text;
    trimmedHistory.push(new AIMessage(responseText));
    await saveHistory(userId, trimmedHistory);
    return responseText;
  } catch (error) {
    console.error("❌ Error:", error);
    return undefined;
  }
};
