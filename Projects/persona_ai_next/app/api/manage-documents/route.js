import { listAllDocuments, deleteDocumentsByFilter } from '../../../lib/vectorStore.js';

export async function GET() {
  try {
    const documents = await listAllDocuments();
    return Response.json({ documents });
  } catch (error) {
    console.error('Error listing documents:', error);
    return Response.json({ 
      error: "Failed to list documents",
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { filter } = await req.json();
    
    if (!filter) {
      return Response.json({ 
        error: "Filter is required for deletion" 
      }, { status: 400 });
    }

    const result = await deleteDocumentsByFilter(filter);
    return Response.json({ 
      message: `Successfully deleted ${result.deleted} documents`,
      deleted: result.deleted 
    });
  } catch (error) {
    console.error('Error deleting documents:', error);
    return Response.json({ 
      error: "Failed to delete documents",
      details: error.message 
    }, { status: 500 });
  }
} 