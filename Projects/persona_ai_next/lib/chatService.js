import OpenAI from 'openai';
import { searchSimilarDocuments } from './vectorStore.js';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI or Azure OpenAI API key or Token Provider not found');
  }
  return new OpenAI({ apiKey });
}

export async function generateRAGResponse(userQuery, conversationHistory = [], filters = {}) {
  try {
    // Search for relevant documents with optional filters
    const relevantDocs = await searchSimilarDocuments(userQuery, 3, filters);

    if (!relevantDocs || relevantDocs.length === 0) {
      return {
        message:
          "I don't have any relevant information in my knowledge base to answer your question. Please upload some documents or add a website first.",
        sources: [],
      };
    }

    // Prepare context from relevant documents
    const context = relevantDocs.map((doc, index) => ({
      content: doc.pageContent,
      source: doc.metadata.source,
      type: doc.metadata.type,
      index: index + 1,
    }));

    const contextText = context
      .map(
        (doc) =>
          `Source ${doc.index} (${doc.type} - ${doc.source}):\n${doc.content}`
      )
      .join("\n\n");

    const SYSTEM_PROMPT = `You are an AI assistant that helps users by answering questions based on the provided context from uploaded documents and websites. 

      Instructions:
      - Only answer based on the information provided in the context
      - If the context doesn't contain relevant information, say so politely
      - Cite your sources by mentioning the source name and type
      - Be concise but comprehensive in your answers
      - If multiple sources contain relevant information, synthesize them appropriately

      Context:
      ${contextText}`;

    // Prepare conversation messages
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: "user", content: userQuery },
    ];

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      message: response.choices[0].message.content,
      sources: context.map((doc) => ({
        source: doc.source,
        type: doc.type,
      })),
    };
  } catch (error) {
    console.error("Error generating RAG response:", error);
    throw error;
  }
}

export function formatConversationHistory(messages) {
  return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
}
 