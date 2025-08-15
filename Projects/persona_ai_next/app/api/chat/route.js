import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, persona } = await req.json();
    
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