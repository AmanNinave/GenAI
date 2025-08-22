import { NextResponse } from 'next/server';
import { processTextInput } from '../../../lib/documentProcessors.js';
import { addDocumentsToVectorStore } from '../../../lib/vectorStore.js';

export async function POST(request) {
  try {
    const { text, source } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: 'Text content too long. Maximum 50,000 characters.' }, { status: 400 });
    }

    // Process the text input ( convert text to documents)
    const documents = await processTextInput(text, source || 'text-input');
    
    // Add documents to vector store
    await addDocumentsToVectorStore(documents);

    return NextResponse.json({
      message: 'Text content added successfully',
      source: source || 'text-input',
      chunks: documents.length
    });

  } catch (error) {
    console.error('Add text error:', error);
    return NextResponse.json(
      { error: 'Failed to add text content: ' + error.message },
      { status: 500 }
    );
  }
} 