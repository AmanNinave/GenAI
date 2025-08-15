"use client"

const ChatMessage = ({ message, formatTime }) => {
  const renderAvatar = (persona) => {
    if (persona?.avatar?.startsWith('http')) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm bg-slate-200 dark:bg-slate-600">
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
          <div className="avatar-fallback hidden w-full h-full items-center justify-center bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-xs">
            {persona.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white text-sm shadow-sm">
        <span>{persona?.avatar || "🤖"}</span>
      </div>
    );
  };

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
          renderAvatar(message.persona)
        )}
      </div>
    </div>
  )
}

export default ChatMessage 