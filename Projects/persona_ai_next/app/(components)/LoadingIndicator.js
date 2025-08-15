"use client"

const LoadingIndicator = ({ persona }) => {
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
    <div className="flex justify-start">
      <div className="mx-2">
        {renderAvatar(persona)}
      </div>
      <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingIndicator 