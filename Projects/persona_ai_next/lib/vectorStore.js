import 'dotenv/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from '@langchain/core/documents';

function getEmbeddings() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAIEmbeddings({ model: 'text-embedding-3-large' });
}

const qdrantConfig = {
  url: process.env.QDRANT_URL,
  collectionName: process.env.QDRANT_COLLECTION_NAME,
  apiKey: process.env.QDRANT_API_KEY,
};

// Simple text splitter function
function splitDocuments(documents, chunkSize = 1000, chunkOverlap = 200) {
  const splitDocs = [];
  
  for (const doc of documents) {
    const text = doc.pageContent;
    const chunks = [];
    
    for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
      const chunk = text.slice(i, i + chunkSize);
      if (chunk.trim().length > 0) {
        chunks.push(new Document({
          pageContent: chunk.trim(),
          metadata: { ...doc.metadata, chunkIndex: chunks.length }
        }));
      }
    }
    
    splitDocs.push(...chunks);
  }
  
  return splitDocs;
}

export async function addDocumentsToVectorStore(documents) {
  try {
    // Split documents into chunks
    const splitDocs = splitDocuments(documents, 1000, 200);

    // Create or update vector store
    const embeddings = getEmbeddings();
    const vectorStore = await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      qdrantConfig
    );

    console.log(`Added ${splitDocs.length} document chunks to vector store`);
    return vectorStore;
  } catch (error) {
    console.error('Error adding documents to vector store:', error);
    throw error;
  }
}

export async function initializeVectorStore() {
  try {
    const embeddings = getEmbeddings();
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      qdrantConfig
    );
    return vectorStore;
  } catch (error) {
    // Collection doesn't exist or embeddings not available
    console.log('Creating new collection or missing embeddings setup...');
    return null;
  }
}

export async function searchSimilarDocuments(query, k = 3, filters = {}) {
  try {
    const vectorStore = await initializeVectorStore();
    if (!vectorStore) {
      throw new Error('Vector store not initialized');
    }

    // Build filter for Qdrant if filters are provided
    let qdrantFilter = null;
    if (Object.keys(filters).length > 0) {
      qdrantFilter = {
        must: Object.entries(filters).map(([key, value]) => ({
          key: key,
          match: { value: value }
        }))
      };
    }

    const retriever = vectorStore.asRetriever({ 
      k,
      filter: qdrantFilter
    });
    const relevantDocs = await retriever.invoke(query);
    
    return relevantDocs;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

export async function deleteDocumentsByFilter(filter) {
  try {
    const vectorStore = await initializeVectorStore();
    if (!vectorStore) {
      throw new Error('Vector store not initialized');
    }

    // Get documents matching the filter
    const docs = await searchSimilarDocuments("", 1000, filter);
    
    // Delete each document
    for (const doc of docs) {
      if (doc.metadata.id) {
        await vectorStore.delete([doc.metadata.id]);
      }
    }
    
    return { deleted: docs.length };
  } catch (error) {
    console.error('Error deleting documents:', error);
    throw error;
  }
}

export async function listAllDocuments() {
  try {
    const vectorStore = await initializeVectorStore();
    if (!vectorStore) {
      throw new Error('Vector store not initialized');
    }

    // Get all documents (with a high limit)
    const docs = await searchSimilarDocuments("", 1000);
    
    // Group by type
    const grouped = docs.reduce((acc, doc) => {
      const type = doc.metadata.type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push({
        source: doc.metadata.source,
        content: doc.pageContent.substring(0, 100) + "...",
        id: doc.metadata.id
      });
      return acc;
    }, {});
    
    return grouped;
  } catch (error) {
    console.error('Error listing documents:', error);
    throw error;
  }
}

export async function getVectorStore() {
  return await initializeVectorStore();
} 