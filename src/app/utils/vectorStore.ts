import { CloudClient, Collection } from "chromadb";

const chromadbClient = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY!,
  tenant: process.env.CHROMA_TENANT!,
  database: process.env.CHROMA_DATABASE!,
});

async function getCollection(): Promise<Collection> {
  return await chromadbClient.getOrCreateCollection({
    name: "conversation_messages",
  });
}

export async function addMessages(
  userId: string,
  userMessage: string,
  aiMessage: string
) {
  const collection = await getCollection();

  const timestamp = Date.now();

  await collection.upsert({
    documents: [userMessage, aiMessage],
    ids: [`${userId}_user_${timestamp}`, `${userId}_ai_${timestamp}`],
    metadatas: [
      { userId, role: "user", storedAt: new Date().toISOString() },
      { userId, role: "assistant", storedAt: new Date().toISOString() },
    ],
  });
}



export async function queryMessages(
  userId: string,
  query: string,
  nResults: number
) {
  const collection = await getCollection();

  const results = await collection.query({
    queryTexts: [query],
    nResults,
    where: { userId },
  });

  const formatted = {
    documents: results.documents[0]
  };

  return formatted;
}
