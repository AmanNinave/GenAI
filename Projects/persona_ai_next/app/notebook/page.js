"use client"

import { useState, useRef, useEffect } from "react"
import ChatMessage from "../(components)/ChatMessage"
import LoadingIndicator from "../(components)/LoadingIndicator"
import ChatInput from "../(components)/ChatInput"

export default function NotebookPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dataSources, setDataSources] = useState([])
  const [activeTab, setActiveTab] = useState("text")
  const [textInput, setTextInput] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isAddingSource, setIsAddingSource] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  
  // Add filter states
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [availableSources, setAvailableSources] = useState([])
  const [databaseSources, setDatabaseSources] = useState([])
  const [showDatabaseSources, setShowDatabaseSources] = useState(false)
  const fetchDatabaseSourcesRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


// Update available sources when dataSources changes
useEffect(() => {
  const sources = dataSources.map(source => source.name);
  setAvailableSources(sources);
}, [dataSources]);

// Load database sources on component mount
useEffect(() => {
  const loadDatabaseSources = async () => {
    try {
      const data = await fetchDatabaseSources();
      const dbSources = data.sources || [];
      const dbSourceNames = dbSources.map((source,index) => ({...source, name : source.source, id : `${Date.now()}-${index}`}));
      setDataSources(prev => [...new Set([...prev, ...dbSourceNames])]);
    } catch (error) {
      console.error('Error loading database sources:', error);
    }
  };
  
  loadDatabaseSources();
}, []); // Empty dependency array = run once on mount

// Function to fetch all sources from database
const fetchDatabaseSources = async () => {
  try {
    const response = await fetch('/api/list-sources');
    if (!response.ok) throw new Error('Failed to fetch sources');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching database sources:', error);
    return { sources: [] };
  }
};

// Function to handle fetching and displaying database sources
const handleFetchDatabaseSources = async () => {
  try {
    const data = await fetchDatabaseSources();
    setDatabaseSources(data.sources || []);
    setShowDatabaseSources(true);
  } catch (error) {
    console.error('Error fetching database sources:', error);
    alert('Failed to fetch sources from database');
  }
};

  const handleAddText = async () => {
    if (!textInput.trim()) return
    
    setIsAddingSource(true)
    try {
      const response = await fetch("/api/add-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput, source: 'text-input' }),
      })
      
      if (!response.ok) throw new Error("Failed to add text")
      
      const data = await response.json()
      setDataSources(prev => [...prev, {
        id: Date.now(),
        type: "text",
        name: "Text Input",
        source: data.source,
        chunks: data.chunks,
        timestamp: new Date()
      }])
      setTextInput("")
    } catch (error) {
      console.error("Error adding text:", error)
      alert("Failed to add text. Please try again.")
    } finally {
      setIsAddingSource(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setIsAddingSource(true)
    const formData = new FormData()
    formData.append("file", file)
    
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) throw new Error("Failed to upload file")
      
      const data = await response.json()
      setDataSources(prev => [...prev, {
        id: Date.now(),
        type: "file",
        name: file.name,
        fileType: data.type,
        chunks: data.chunks,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsAddingSource(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleAddWebsite = async () => {
    if (!websiteUrl.trim()) return
    
    setIsAddingSource(true)
    try {
      const response = await fetch("/api/add-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      })
      
      if (!response.ok) throw new Error("Failed to add website")
      
      const data = await response.json()
      setDataSources(prev => [...prev, {
        id: Date.now(),
        type: "website",
        name: new URL(websiteUrl).hostname,
        url: websiteUrl,
        chunks: data.chunks,
        timestamp: new Date()
      }])
      setWebsiteUrl("")
    } catch (error) {
      console.error("Error adding website:", error)
      alert("Failed to add website. Please try again.")
    } finally {
      setIsAddingSource(false)
    }
  }

  const handleAddYoutube = async () => {
    if (!youtubeUrl.trim()) return
    
    setIsAddingSource(true)
    try {
      const response = await fetch("/api/add-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      })
      
      if (!response.ok) throw new Error("Failed to add YouTube video")
      
      const data = await response.json()
      setDataSources(prev => [...prev, {
        id: Date.now(),
        type: "youtube",
        name: data.title || "YouTube Video",
        url: youtubeUrl,
        chunks: data.chunks,
        timestamp: new Date()
      }])
      setYoutubeUrl("")
    } catch (error) {
      console.error("Error adding YouTube video:", error)
      alert("Failed to add YouTube video. Please try again.")
    } finally {
      setIsAddingSource(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user", content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Build filters based on selection
      let filters = {};
      if (selectedFilter !== "all") {
        if (selectedFilter === "pdf") {
          filters.type = "pdf";
        } else if (selectedFilter === "vtt") {
          filters.type = "vtt";
        } else if (selectedFilter === "txt") {
          filters.type = "txt";
        } else if (selectedFilter === "docx") {
          filters.type = "docx";
        } else if (selectedFilter.startsWith("source:")) {
          filters.source = selectedFilter.replace("source:", "");
        }
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          useRAG: true,
          filters: filters
        }),
      })
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const data = await response.json()
      
      const aiMessage = { 
        role: "assistant", 
        content: data.content,
        sources: data.sources,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat API Error:", error)
      const errorMessage = { 
        role: "assistant", 
        content: "Sorry, I'm having trouble responding right now. Please try again later.", 
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    if(!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Add filter component
  const FilterSelector = () => (
    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Filter Sources
      </h3>
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
      >
        <option value="all">All Sources</option>
        <option value="pdf">PDF Files Only</option>
        <option value="vtt">VTT Files Only</option>
        <option value="txt">Text Files Only</option>
        <option value="docx">DOCX Files Only</option>
        {availableSources.map(source => (
          <option key={source} value={`source:${source}`}>
            {source}
          </option>
        ))}
      </select>
      
      <button
        onClick={handleFetchDatabaseSources}
        className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        View All Database Sources
      </button>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Left Sidebar - Data Sources */}
      <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Data Sources</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Add documents to your knowledge base</p>
        </div>

        {/* Add Filter Selector */}
        <FilterSelector />

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "text"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "file"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            File
          </button>
          <button
            onClick={() => setActiveTab("website")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "website"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Website
          </button>
          <button
            onClick={() => setActiveTab("youtube")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "youtube"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            YouTube
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === "text" && (
            <div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter or paste your text here..."
                className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                onClick={handleAddText}
                disabled={!textInput.trim() || isAddingSource}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingSource ? "Adding..." : "Add Text"}
              </button>
            </div>
          )}

          {activeTab === "file" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.txt,.csv,.docx,.vtt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAddingSource}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingSource ? "Uploading..." : "Choose File"}
              </button>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Supported: PDF, TXT, CSV, DOCX, VTT (Max 10MB)
              </p>
            </div>
          )}

          {activeTab === "website" && (
            <div>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                onClick={handleAddWebsite}
                disabled={!websiteUrl.trim() || isAddingSource}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingSource ? "Adding..." : "Add Website"}
              </button>
            </div>
          )}

          {activeTab === "youtube" && (
            <div>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                onClick={handleAddYoutube}
                disabled={!youtubeUrl.trim() || isAddingSource}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingSource ? "Adding..." : "Add YouTube Video"}
              </button>
            </div>
          )}

          {/* Data Sources List */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Added Sources ({dataSources.length})
            </h3>
            <div className="space-y-2">
              {dataSources.map((source) => (
                <div
                  key={source.id}
                  className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {source.name}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {source.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {source.chunks} chunks • {formatTime(source.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Sources Modal */}
          {showDatabaseSources && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Database Sources ({databaseSources.length})
                  </h3>
                  <button
                    onClick={() => setShowDatabaseSources(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  {databaseSources.length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                      No sources found in database
                    </p>
                  ) : (
                    databaseSources.map((source, index) => (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-800 dark:text-white">
                            {source.source}
                          </span>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {source.type}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {source.chunks} chunks
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 p-2 rounded">
                          {source.preview}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            RAG Notebook
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ask questions about your uploaded documents
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    Welcome to RAG Notebook
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    Upload documents, websites, or YouTube videos on the left, then ask questions about them here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    formatTime={formatTime}
                  />
                ))}
                {isLoading && <LoadingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
