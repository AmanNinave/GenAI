"use client"

import { useState, useRef, useEffect } from "react"
import { personas } from "../data/personas"
import PersonaSelector from "../(components)/PersonaSelector"
import ChatMessage from "../(components)/ChatMessage"
import LoadingIndicator from "../(components)/LoadingIndicator"
import ChatInput from "../(components)/ChatInput"

const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [selectedPersona, setSelectedPersona] = useState(personas[0])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user", content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          persona: selectedPersona
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const aiMessage = { 
        role: "assistant", 
        content: data.content, 
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat API Error:", error);
      // Add error message to chat
      const errorMessage = { 
        role: "assistant", 
        content: "Sorry, I'm having trouble responding right now. Please try again later.", 
        timestamp: new Date(), 
        persona: selectedPersona 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderAvatar = (persona, size = "w-15 h-10") => {
    if (persona?.avatar?.startsWith('http')) {
      return (
        <div className={`${size} rounded-full overflow-hidden shadow-sm bg-slate-200 dark:bg-slate-600`}>
          <img 
            src={persona.avatar} 
            alt={persona.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide the image and show fallback
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.avatar-fallback');
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          <div className="avatar-fallback hidden w-full h-full items-center justify-center bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm">
            {persona.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        </div>
      );
    }
    return (
      <div className={`${size} rounded-full ${persona.color} flex items-center justify-center text-white text-lg shadow-sm`}>
        {persona.avatar}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header with Persona Selection */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Chat with {selectedPersona.name}
            </h1>
            
            <PersonaSelector
              personas={personas}
              selectedPersona={selectedPersona}
              onPersonaChange={setSelectedPersona}
            />
          </div>
          
          {/* Selected Persona Info */}
          <div className="mt-3 flex items-center space-x-3">
            {renderAvatar(selectedPersona)}
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPersona.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center flex flex-col items-center">
                  {renderAvatar(selectedPersona, "w-20 h-20")}
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 mt-4">
                    Start chatting with {selectedPersona.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    {selectedPersona.description}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  formatTime={formatTime}
                />
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && <LoadingIndicator persona={selectedPersona} />}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            persona={selectedPersona}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatPage