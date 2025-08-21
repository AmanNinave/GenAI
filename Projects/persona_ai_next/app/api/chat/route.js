import OpenAI from "openai";
import { generateRAGResponse, formatConversationHistory } from "../../../lib/chatService.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, persona, useRAG } = await req.json();
    
    // If RAG is enabled, use the RAG service
    if (useRAG) {
      const lastMessage = messages[messages.length - 1];
      const conversationHistory = formatConversationHistory(messages.slice(0, -1));
      
      const ragResponse = await generateRAGResponse(lastMessage.content, conversationHistory);
      
      return Response.json({ 
        content: ragResponse.message,
        sources: ragResponse.sources
      });
    }
    
    // Otherwise, use the regular chat completion
    // Add system message with persona context
    const systemMessage = {
      role: "system",
      content: persona?.systemPrompt || "You are a helpful AI assistant."
    };

    // Create messages array with system message first
    const messagesWithSystem = [systemMessage, ...messages];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesWithSystem,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return Response.json({ 
      content: response.choices[0].message.content
    });
    
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return Response.json({ 
      error: "Failed to generate response",
      details: error.message 
    }, { status: 500 });
  }
}