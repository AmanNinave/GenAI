#!/usr/bin/env node

import 'dotenv/config';
import { listAllDocuments } from '../lib/vectorStore.js';

async function queryDatabase() {
  try {
    console.log('🔍 Querying vector database...\n');
    
    const documents = await listAllDocuments();
    
    if (Object.keys(documents).length === 0) {
      console.log('❌ No documents found in the database.');
      return;
    }
    
    console.log('📊 Database Contents:\n');
    
    let totalChunks = 0;
    let totalSources = 0;
    
    for (const [type, docs] of Object.entries(documents)) {
      console.log(`📁 ${type.toUpperCase()} Files:`);
      
      // Group by source
      const sourceGroups = {};
      docs.forEach(doc => {
        const source = doc.source;
        if (!sourceGroups[source]) {
          sourceGroups[source] = 0;
        }
        sourceGroups[source]++;
      });
      
      for (const [source, chunks] of Object.entries(sourceGroups)) {
        console.log(`   📄 ${source} (${chunks} chunks)`);
        totalChunks += chunks;
        totalSources++;
      }
      console.log('');
    }
    
    console.log('📈 Summary:');
    console.log(`   Total Sources: ${totalSources}`);
    console.log(`   Total Chunks: ${totalChunks}`);
    console.log(`   Document Types: ${Object.keys(documents).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
    process.exit(1);
  }
}

// Run the query
queryDatabase(); 