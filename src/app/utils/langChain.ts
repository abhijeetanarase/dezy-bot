
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { addMessages, queryMessages } from "./vectorStore";



const apiKey: string | undefined = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is missing");
}


const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey,
});

export const makeRequest = async (
  userId: string,
  systemPrompt: string = "You are a helpful assistant for Dezy Clinic...",
  prompt: string
): Promise<string | undefined> => {
  try {
   const relevantDocs = await queryMessages(userId, prompt, 6);
   const context = relevantDocs.documents?.flat() || [];
   const messagesForGeneration = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`User Context:\n${context.join("\n")}\n\nCurrent Question: ${prompt}`)
    ];
    const response = await chatModel.invoke(messagesForGeneration);
    const responseContent = response.content.toString();
   await addMessages(userId,
      `User: ${prompt}`,
      `Assistant: ${responseContent}`
    );
    return responseContent;
  } catch (error) {
    console.error("❌ Error in makeRequest:", error);
    return undefined;
  }
};
