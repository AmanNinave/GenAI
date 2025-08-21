import { NextResponse } from 'next/server';
import { generateRAGResponse, formatConversationHistory } from '../../../lib/chatService.js';

export async function POST(request) {
  try {
    const { messages, useRAG } = await request.json();

      // If RAG is enabled, use the RAG service
    if (useRAG) {
      const lastMessage = messages[messages.length - 1];
      const conversationHistory = messages.slice(0, -1);
      
      const ragResponse = await generateRAGResponse(lastMessage.content, conversationHistory);
      
      return Response.json({ 
        content: ragResponse.message,
        sources: ragResponse.sources
      });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message too long. Maximum 1000 characters.' }, { status: 400 });
    }

    // Format conversation history
    const conversationHistory = history ? formatConversationHistory(history) : [];

    // Generate RAG response
    const response = await generateRAGResponse(message, conversationHistory);

    return NextResponse.json({
      message: response.message,
      sources: response.sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response: ' + error.message },
      { status: 500 }
    );
  }
} 