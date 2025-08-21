import { NextResponse } from 'next/server';
import { processYouTubeVideo } from '../../../lib/documentProcessors.js';
import { addDocumentsToVectorStore } from '../../../lib/vectorStore.js';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || url.trim().length === 0) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL format' }, { status: 400 });
    }

    // Process the YouTube video
    const documents = await processYouTubeVideo(url);
    
    if (!documents || documents.length === 0) {
      return NextResponse.json({ error: 'Could not extract transcript from the YouTube video' }, { status: 400 });
    }

    // Add documents to vector store
    await addDocumentsToVectorStore(documents);

    return NextResponse.json({
      message: 'YouTube video transcript added successfully',
      url: url,
      title: documents[0].metadata.title || 'YouTube Video',
      chunks: documents.length,
      transcriptSegments: documents[0].metadata.transcriptSegments
    });

  } catch (error) {
    console.error('Add YouTube error:', error);
    return NextResponse.json(
      { error: 'Failed to add YouTube video: ' + error.message },
      { status: 500 }
    );
  }
} 