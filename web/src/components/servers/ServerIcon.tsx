// server icon button with hover effects

import type { Server } from '../../types/server'

interface ServerIconProps {
  server: Server
  isSelected: boolean
  onClick: () => void
}

export default function ServerIcon({ server, isSelected, onClick }: ServerIconProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-2xl flex items-center justify-center
        transition-all duration-200 group relative
        ${
          isSelected
            ? 'rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white hover:rounded-xl hover:shadow-lg hover:shadow-indigo-500/30'
        }
      `}
      title={server.name}
    >
      {/* Server icon or initial */}
      {server.icon_url ? (
        <img
          src={server.icon_url}
          alt={server.name}
          className="w-full h-full object-cover rounded-2xl group-hover:rounded-xl transition-all duration-200"
        />
      ) : (
        <span className="text-lg font-semibold">
          {server.name.charAt(0).toUpperCase()}
        </span>
      )}

      {/* Active indicator */}
      {isSelected && (
        <div className="absolute -left-3 w-1 h-8 bg-white rounded-r-full" />
      )}
    </button>
  )
}
