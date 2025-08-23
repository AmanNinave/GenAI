import { Document } from '@langchain/core/documents';
import fs from 'fs';
import path from 'path';

// LangChain document loaders
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";

import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

export async function processTextInput(text, source = 'text-input') {
  try {
    const doc = new Document({
      pageContent: text,
      metadata: { source, type: 'text' }
    });
    return [doc];
  } catch (error) {
    console.error('Error processing text input:', error);
    throw error;
  }
}

export async function processUploadedFile(filePath, originalName) {
  try {
    const extension = path.extname(originalName).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return await processPDF(filePath, originalName);
      case '.csv':
        return await processCSV(filePath, originalName);
      case '.txt':
        return await processText(filePath, originalName);
      case '.docx':
        return await processDocx(filePath, originalName);
      default:
        throw new Error(`Unsupported file type: ${extension}. Supported types: PDF, TXT, CSV, DOCX`);
    }
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    throw error;
  }
}

async function processPDF(filePath, originalName) {
  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    // Add metadata to each document
    const processedDocs = docs.map(doc => new Document({
      pageContent: doc.pageContent,
      metadata: { 
        ...doc.metadata,
        source: originalName, 
        type: 'pdf'
      }
    }));
    
    return processedDocs;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF file: ${error.message}`);
  }
}

async function processCSV(filePath, originalName) {
  try {
    const loader = new CSVLoader(filePath);
    const docs = await loader.load();
    
    // Add metadata to each document
    const processedDocs = docs.map(doc => new Document({
      pageContent: doc.pageContent,
      metadata: { 
        ...doc.metadata,
        source: originalName, 
        type: 'csv'
      }
    }));
    
    return processedDocs;
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw new Error(`Failed to process CSV file: ${error.message}`);
  }
}

async function processText(filePath, originalName) {
  try {
    const loader = new TextLoader(filePath);
    const docs = await loader.load();
    
    // Add metadata to each document
    const processedDocs = docs.map(doc => new Document({
      pageContent: doc.pageContent,
      metadata: { 
        ...doc.metadata,
        source: originalName, 
        type: 'text'
      }
    }));
    
    return processedDocs;
  } catch (error) {
    console.error('Error processing text file:', error);
    throw new Error(`Failed to process text file: ${error.message}`);
  }
}

async function processDocx(filePath, originalName) {
  try {
    const loader = new DocxLoader(filePath);
    const docs = await loader.load();
    
    // Add metadata to each document
    const processedDocs = docs.map(doc => new Document({
      pageContent: doc.pageContent,
      metadata: { 
        ...doc.metadata,
        source: originalName, 
        type: 'docx'
      }
    }));
    
    return processedDocs;
  } catch (error) {
    console.error('Error processing DOCX:', error);
    throw new Error(`Failed to process DOCX file: ${error.message}`);
  }
}

export async function processWebsite(url) {
  try {
    const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

    const loader = new RecursiveUrlLoader(url, {
      extractor: compiledConvert,
      maxDepth: 5,
      excludeDirs: ['/api', '/docs/api'],
    });
    
    const docs = await loader.load();
    
    // Clean up the content and add metadata
    const processedDocs = docs.map(doc => new Document({
      pageContent: doc.pageContent.replace(/\s+/g, ' ').trim(),
      metadata: { 
        ...doc.metadata,
        source: url, 
        type: 'website'
      }
    }));
    
    return processedDocs;
  } catch (error) {
    console.error('Error processing website:', error);
    throw new Error(`Failed to process website: ${error.message}`);
  }
}

export async function processYouTubeVideo(url) {
  try {
    const loader = YoutubeLoader.createFromUrl(url, {
      addVideoInfo: true,
    });
    
    const docs = await loader.load();
    
    // Add metadata to each document
    const processedDocs = docs.map(doc => new Document({
      pageContent: doc.pageContent,
      metadata: { 
        ...doc.metadata,
        source: url, 
        type: 'youtube'
      }
    }));
    
    return processedDocs;
  } catch (error) {
    console.error('Error processing YouTube video:', error);
    throw new Error(`Failed to process YouTube video: ${error.message}`);
  }
}

export function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
} 