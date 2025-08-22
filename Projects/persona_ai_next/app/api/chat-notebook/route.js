import { NextResponse } from 'next/server';
import { generateRAGResponse } from '../../../lib/chatService.js';

export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (messages.length > 1000) {
      return NextResponse.json({ error: 'Message too long. Maximum 1000 characters.' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const conversationHistory = messages.slice(0, -1);
    
    const ragResponse = await generateRAGResponse(lastMessage.content, conversationHistory);
    
    return Response.json({ 
      content: ragResponse.message,
      sources: ragResponse.sources
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response: ' + error.message },
      { status: 500 }
    );
  }
} 