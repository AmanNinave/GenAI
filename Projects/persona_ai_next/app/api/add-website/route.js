import { NextResponse } from 'next/server';
import { processWebsite } from '../../../lib/documentProcessors.js';
import { addDocumentsToVectorStore } from '../../../lib/vectorStore.js';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || url.trim().length === 0) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Process the website
    const documents = await processWebsite(url);
    
    if (!documents || documents.length === 0) {
      return NextResponse.json({ error: 'Could not extract content from the website' }, { status: 400 });
    }

    // Add documents to vector store
    await addDocumentsToVectorStore(documents);

    return NextResponse.json({
      message: 'Website content added successfully',
      url: url,
      chunks: documents.length
    });

  } catch (error) {
    console.error('Add website error:', error);
    return NextResponse.json(
      { error: 'Failed to add website content: ' + error.message },
      { status: 500 }
    );
  }
} 