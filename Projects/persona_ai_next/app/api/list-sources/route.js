import { listAllDocuments } from '../../../lib/vectorStore.js';

export async function GET() {
  try {
    const documents = await listAllDocuments();
    
    // Transform the grouped documents into a more readable format
    const sources = [];
    
    for (const [type, docs] of Object.entries(documents)) {
      // Group by source within each type
      const sourceGroups = {};
      
      docs.forEach(doc => {
        const source = doc.source;
        if (!sourceGroups[source]) {
          sourceGroups[source] = {
            source: source,
            type: type,
            chunks: 0,
            preview: doc.content
          };
        }
        sourceGroups[source].chunks++;
      });
      
      // Add each source group to the main sources array
      sources.push(...Object.values(sourceGroups));
    }
    
    return Response.json({ 
      sources,
      totalSources: sources.length,
      totalChunks: sources.reduce((sum, source) => sum + source.chunks, 0)
    });
  } catch (error) {
    console.error('Error listing sources:', error);
    return Response.json({ 
      error: "Failed to list sources",
      details: error.message 
    }, { status: 500 });
  }
} 