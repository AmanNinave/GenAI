"use client"

const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="mx-2">
        <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white text-sm shadow-sm">
          <span>🤖</span>
        </div>
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