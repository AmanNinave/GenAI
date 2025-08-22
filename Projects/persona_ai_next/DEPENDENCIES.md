# Dependencies Documentation

This document explains all the dependencies used in the RAG Notebook application and their purposes.

## Core Dependencies

### **Next.js Framework**
- **`next@15.4.6`**: React framework for production
- **`react@19.1.0`**: React library for building user interfaces
- **`react-dom@19.1.0`**: React DOM rendering

### **AI and Language Models**
- **`openai@5.12.2`**: OpenAI API client for GPT models
- **`@langchain/openai@0.0.10`**: LangChain integration with OpenAI
- **`@langchain/core@0.1.63`**: Core LangChain functionality
- **`@langchain/community@0.0.10`**: Community LangChain integrations
- **`@langchain/qdrant@0.0.3`**: Qdrant vector database integration

### **Vector Database**
- **`@langchain/qdrant@0.0.3`**: Qdrant vector store for storing document embeddings

### **Document Processing (LangChain Loaders)**
- **`@langchain/community`**: Contains all document loaders:
  - **`PDFLoader`**: Parse PDF files and extract text
  - **`TextLoader`**: Parse TXT files and extract text
  - **`CSVLoader`**: Parse CSV files and extract data
  - **`DocxLoader`**: Parse DOCX files and extract text
  - **`CheerioWebBaseLoader`**: Parse HTML and extract text from websites
  - **`YoutubeLoader`**: Extract transcripts from YouTube videos

### **Environment and Configuration**
- **`dotenv@16.6.1`**: Load environment variables from .env files

## Development Dependencies

### **Styling**
- **`tailwindcss@4.1.12`**: Utility-first CSS framework
- **`@tailwindcss/postcss@4.1.12`**: PostCSS plugin for Tailwind CSS

### **Code Quality**
- **`eslint@9.33.0`**: JavaScript linting utility
- **`eslint-config-next@15.4.6`**: ESLint configuration for Next.js
- **`@eslint/eslintrc@3.3.1`**: ESLint configuration utilities

## Dependency Purposes

### **RAG (Retrieval Augmented Generation)**
- **LangChain packages**: Provide the framework for building RAG applications
- **Qdrant**: Stores vector embeddings for semantic search
- **OpenAI**: Provides the language model for generating responses

### **Document Processing Pipeline**
1. **File Upload**: PDF, DOCX, CSV, TXT files
2. **Text Extraction**: Using LangChain document loaders for each format
3. **Web Scraping**: CheerioWebBaseLoader for extracting content from websites
4. **YouTube Processing**: YoutubeLoader for video transcript extraction
5. **Vector Embedding**: Converting text to numerical vectors
6. **Storage**: Storing vectors in Qdrant for retrieval

### **User Interface**
- **Next.js**: Provides the web framework and routing
- **React**: Builds the interactive user interface
- **Tailwind CSS**: Styles the application with utility classes

## LangChain Document Loaders

### **PDFLoader**
- **Purpose**: Extract text from PDF documents
- **Features**: Handles multi-page PDFs, preserves formatting
- **Usage**: `new PDFLoader(filePath)`

### **TextLoader**
- **Purpose**: Load plain text files
- **Features**: UTF-8 encoding support, line-by-line processing
- **Usage**: `new TextLoader(filePath)`

### **CSVLoader**
- **Purpose**: Parse CSV files and convert to text
- **Features**: Header detection, column mapping
- **Usage**: `new CSVLoader(filePath)`

### **DocxLoader**
- **Purpose**: Extract text from Microsoft Word documents
- **Features**: Handles formatting, tables, and images
- **Usage**: `new DocxLoader(filePath)`

### **CheerioWebBaseLoader**
- **Purpose**: Scrape and extract text from websites
- **Features**: CSS selector support, HTML parsing
- **Usage**: `new CheerioWebBaseLoader(url, { selector: 'body' })`

### **YoutubeLoader**
- **Purpose**: Extract transcripts from YouTube videos
- **Features**: Video metadata, transcript processing
- **Usage**: `new YoutubeLoader(url, { addVideoInfo: true })`

## Installation

```bash
# Install all dependencies
npm install

# Install only production dependencies
npm install --production

# Install only development dependencies
npm install --save-dev
```

## Version Compatibility

- **Node.js**: >= 18.0.0 (specified in package.json engines)
- **Next.js**: 15.4.6 (latest stable)
- **React**: 19.1.0 (latest stable)

## Known Issues

### **Node.js Version Warnings**
Some packages require Node.js >= 20.16.0, but the application works with Node.js >= 18.0.0. These warnings can be safely ignored for development.

### **Security Vulnerabilities**
Run `npm audit fix` to address any security vulnerabilities in dependencies.

## Adding New Dependencies

When adding new dependencies:

1. **Check if LangChain has a loader** for the file type first
2. **Use LangChain loaders** whenever possible for consistency
3. **Update this documentation** with the new dependency
4. **Test thoroughly** to ensure no conflicts
5. **Consider bundle size** impact for production builds

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### **Dependency Conflicts**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Version Issues**
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update
```

### **Security Issues**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### **LangChain Loader Issues**
If you encounter issues with LangChain loaders:
- Check the LangChain documentation for the specific loader
- Ensure the file format is supported
- Verify the file is not corrupted
- Check for any required dependencies that the loader might need 