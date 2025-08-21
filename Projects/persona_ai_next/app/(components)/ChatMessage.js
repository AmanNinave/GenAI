"use client"

const ChatMessage = ({ message, formatTime }) => {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${message.role === "user" ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            message.role === "user"
              ? "bg-blue-500 text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Sources section for RAG responses */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                Sources:
              </p>
              <div className="space-y-1">
                {message.sources.map((source, index) => (
                  <div key={index} className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center">
                      <span className="mr-1">•</span>
                      <span className="capitalize">{source.type}</span>: {source.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className={`text-xs mt-1 ${
            message.role === "user" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
          }`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
      
      {/* Avatar */}
      <div className={`mx-2 ${message.role === "user" ? "order-1" : "order-1"}`}>
        {message.role === "user" ? (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shadow-sm">
            <span>👤</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white text-sm shadow-sm">
            <span>🤖</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage 