# RAG Notebook - NotebookLM Clone

A Retrieval Augmented Generation (RAG) application that allows you to upload documents, websites, and YouTube videos to create a personal knowledge base and ask questions about your content.

## Features

- **Multiple Data Sources Support**:
  - Text input (direct text entry)
  - File uploads (PDF, TXT, CSV, DOCX)
  - Website content extraction
  - YouTube video transcripts

- **Advanced RAG Capabilities**:
  - Document chunking and indexing
  - Semantic search using vector embeddings
  - Context-aware responses with source citations
  - Conversation history support

- **Modern UI**:
  - Clean, responsive interface
  - Real-time data source management
  - Source tracking for transparency

## Prerequisites

1. **Node.js** (v18 or higher)
2. **OpenAI API Key**
3. **Docker and Docker Compose** (for Qdrant)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd persona_ai_next
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Qdrant Vector Database

#### Option A: Using Docker Compose (Recommended)
```bash
# Start Qdrant using Docker Compose
docker-compose up -d

# Check if Qdrant is running
docker-compose ps
```

#### Option B: Manual Docker Run
```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

#### Option C: Qdrant Cloud
Sign up at [cloud.qdrant.io](https://cloud.qdrant.io) and get your cloud URL and API key.

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Configuration
QDRANT_URL=http://localhost:6333  # or your Qdrant Cloud URL
QDRANT_COLLECTION_NAME=rag-notebook-collection
```

### 5. Verify setup (optional)
```bash
npm run check-setup
```

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Compose Configuration

The project includes a `docker-compose.yml` file for easy Qdrant setup:

```yaml
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant-vector-db
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage
    restart: unless-stopped
```

### Docker Compose Commands

```bash
# Start Qdrant
docker-compose up -d

# Stop Qdrant
docker-compose down

# View logs
docker-compose logs -f qdrant

# Restart Qdrant
docker-compose restart qdrant
```

## Usage

1. **Add Data Sources**:
   - Click on the tabs in the left sidebar
   - Add text, upload files, enter website URLs, or YouTube links
   - Data will be processed and indexed automatically

2. **Ask Questions**:
   - Type your questions in the chat input
   - The AI will search through your uploaded content
   - Responses include source citations

3. **Supported File Types**:
   - PDF documents
   - Text files (.txt)
   - CSV files
   - Word documents (.docx)

## Architecture

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Vector Store**: Qdrant
- **Embeddings**: OpenAI text-embedding-3-large
- **LLM**: GPT-4o-mini
- **Document Processing**: LangChain

## Project Structure

```
persona_ai_next/
├── app/
│   ├── (components)/      # Reusable UI components
│   ├── api/              # API routes
│   │   ├── add-text/     # Text input processing
│   │   ├── add-website/  # Website scraping
│   │   ├── add-youtube/  # YouTube transcript extraction
│   │   ├── chat/         # RAG chat endpoint
│   │   └── upload/       # File upload processing
│   ├── chat/             # Original chat application
│   ├── notebook/         # RAG notebook application
│   └── page.js           # Landing page
├── lib/
│   ├── chatService.js    # RAG response generation
│   ├── documentProcessors.js  # Document parsing
│   └── vectorStore.js    # Vector database operations
├── docker-compose.yml    # Qdrant Docker configuration
└── package.json
```

## Development Notes

- The application uses server-side processing for document handling
- Vector embeddings are created using OpenAI's embedding model
- Document chunking is set to 1000 characters with 200 character overlap
- The chat maintains conversation history for context

## Troubleshooting

1. **"Vector store not initialized" error**:
   - Ensure Qdrant is running: `docker-compose ps`
   - Check QDRANT_URL in your .env.local file

2. **"Failed to add document" errors**:
   - Verify your OpenAI API key is valid
   - Check that the file size is under 10MB

3. **YouTube transcript errors**:
   - Ensure the video has captions available
   - Check that the URL is a valid YouTube video link

4. **Docker issues**:
   - Make sure Docker is running
   - Try restarting the container: `docker-compose restart qdrant`

## Future Enhancements

- Support for more file types
- Document management (delete/update)
- Export conversations
- Multi-language support
- Advanced search filters
