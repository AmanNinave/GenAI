import { Document } from '@langchain/core/documents';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import Papa from 'papaparse';
import mammoth from 'mammoth';
import { YoutubeTranscript } from 'youtube-transcript';
import * as cheerio from 'cheerio';

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
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    throw error;
  }
}

async function processPDF(filePath, originalName) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    const doc = new Document({
      pageContent: data.text,
      metadata: { 
        source: originalName, 
        type: 'pdf',
        pages: data.numpages
      }
    });
    
    return [doc];
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

async function processCSV(filePath, originalName) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const results = Papa.parse(csvContent, { header: true });
    
    const textContent = results.data.map(row => 
      Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ')
    ).join('\n');
    
    const doc = new Document({
      pageContent: textContent,
      metadata: { 
        source: originalName, 
        type: 'csv',
        rows: results.data.length
      }
    });
    
    return [doc];
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
}

async function processText(filePath, originalName) {
  try {
    const textContent = fs.readFileSync(filePath, 'utf8');
    
    const doc = new Document({
      pageContent: textContent,
      metadata: { 
        source: originalName, 
        type: 'text'
      }
    });
    
    return [doc];
  } catch (error) {
    console.error('Error processing text file:', error);
    throw error;
  }
}

async function processDocx(filePath, originalName) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    const doc = new Document({
      pageContent: result.value,
      metadata: { 
        source: originalName, 
        type: 'docx'
      }
    });
    
    return [doc];
  } catch (error) {
    console.error('Error processing DOCX:', error);
    throw error;
  }
}

export async function processWebsite(url) {
  try {
    // Fetch the webpage content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Use cheerio to parse and extract text
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script').remove();
    $('style').remove();
    
    // Get the title
    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    
    // Extract text content from body
    const bodyText = $('body').text();
    
    // Clean up the text
    const cleanedText = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
    
    if (!cleanedText) {
      throw new Error('No text content found on the webpage');
    }
    
    const doc = new Document({
      pageContent: cleanedText,
      metadata: { 
        source: url, 
        type: 'website',
        title: title.trim()
      }
    });
    
    return [doc];
  } catch (error) {
    console.error('Error processing website:', error);
    throw error;
  }
}

export async function processYouTubeVideo(url) {
  try {
    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      throw new Error('Invalid YouTube URL');
    }
    
    const videoId = videoIdMatch[1];
    
    // Fetch the transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }
    
    // Combine transcript segments into a single text
    const fullText = transcript
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Try to get video title from the page
    let title = 'YouTube Video';
    try {
      // For title, we'll use a simple approach - extract from URL if available
      // In production, you might want to use YouTube Data API
      const titleMatch = url.match(/[?&]title=([^&]+)/);
      if (titleMatch) {
        title = decodeURIComponent(titleMatch[1]);
      }
    } catch (e) {
      // Keep default title
    }
    
    const doc = new Document({
      pageContent: fullText,
      metadata: { 
        source: url, 
        type: 'youtube',
        videoId: videoId,
        title: title,
        transcriptSegments: transcript.length
      }
    });
    
    return [doc];
  } catch (error) {
    console.error('Error processing YouTube video:', error);
    throw error;
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