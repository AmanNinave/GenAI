import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { processUploadedFile, cleanupTempFile } from '../../../lib/documentProcessors.js';
import { addDocumentsToVectorStore } from '../../../lib/vectorStore.js';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.txt', '.csv', '.docx', '.vtt'];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = path.join(uploadsDir, `temp_${Date.now()}_${file.name}`);
    await writeFile(tempFilePath, buffer);

    try {
      // Process the uploaded file
      const documents = await processUploadedFile(tempFilePath, file.name);
      
      // Add documents to vector store
      await addDocumentsToVectorStore(documents);

      // Clean up temp file
      cleanupTempFile(tempFilePath);

      return NextResponse.json({
        message: 'File uploaded and processed successfully',
        filename: file.name,
        type: fileExtension,
        chunks: documents.length
      });

    } catch (processingError) {
      // Clean up temp file on error
      cleanupTempFile(tempFilePath);
      throw processingError;
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process uploaded file: ' + error.message },
      { status: 500 }
    );
  }
} 