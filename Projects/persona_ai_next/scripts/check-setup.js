import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local if it exists
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Checking RAG Notebook setup...\n');

// Check OpenAI API Key
const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  console.log('   Please create a .env.local file with your OpenAI API key');
  process.exit(1);
} else {
  console.log('✅ OpenAI API key found');
}

// Check Qdrant configuration
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const collectionName = process.env.QDRANT_COLLECTION_NAME || 'rag-notebook-collection';

console.log(`✅ Qdrant URL: ${qdrantUrl}`);
console.log(`✅ Collection name: ${collectionName}`);

// Try to connect to Qdrant
console.log('\n🔍 Testing Qdrant connection...');
try {
  const response = await fetch(`${qdrantUrl}/collections`);
  if (response.ok) {
    console.log('✅ Successfully connected to Qdrant');
    
    const data = await response.json();
    const collections = data.result?.collections || [];
    const hasCollection = collections.some(c => c.name === collectionName);
    
    if (hasCollection) {
      console.log(`✅ Collection "${collectionName}" exists`);
    } else {
      console.log(`ℹ️  Collection "${collectionName}" will be created on first document upload`);
    }
  } else {
    throw new Error(`HTTP ${response.status}`);
  }
} catch (error) {
  console.error('❌ Failed to connect to Qdrant');
  console.log('   Make sure Qdrant is running:');
  console.log('   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant');
  console.log(`   Error: ${error.message}`);
  process.exit(1);
}

console.log('\n✨ Setup verification complete! Your RAG Notebook is ready to use.');
console.log('\nRun "npm run dev" to start the application.'); 