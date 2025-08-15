"use client"

const PersonaSelector = ({ personas, selectedPersona, onPersonaChange }) => {
  const renderAvatar = (persona) => {
    if (persona.avatar.startsWith('http')) {
      return (
        <img 
          src={persona.avatar} 
          alt={persona.name}
          className="w-4 h-4 rounded-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'inline';
          }}
        />
      );
    }
    return <span>{persona.avatar}</span>;
  };

  return (
    <div className="relative">
      <select
        value={selectedPersona.id}
        onChange={(e) => onPersonaChange(personas.find(p => p.id === e.target.value))}
        className="appearance-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 pr-10 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-500"
      >
        {personas.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default PersonaSelector 