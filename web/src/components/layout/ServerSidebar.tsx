/**
 * Server sidebar - left panel with server icons.
 * Displays vertical list of servers the user belongs to.
 */

import { useState } from 'react'
import { useServerStore } from '../../stores/serverStore'
import ServerIcon from '../servers/ServerIcon'
import CreateServerModal from '../servers/CreateServerModal'

export default function ServerSidebar() {
  const { servers, selectedServerId, selectServer } = useServerStore()
  const serverList = Object.values(servers)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="w-[72px] bg-gray-950 flex flex-col items-center py-3 gap-2">
      {/* Home/DM button - Phase 3 feature, placeholder for now */}
      <button
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600
                   flex items-center justify-center text-white font-semibold text-lg
                   hover:rounded-xl transition-all duration-200
                   shadow-lg hover:shadow-indigo-500/50"
        title="Direct Messages"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-gray-800 rounded-full" />

      {/* Server list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 scrollbar-hide">
        {serverList.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isSelected={selectedServerId === server.id}
            onClick={() => selectServer(server.id)}
          />
        ))}
      </div>

      {/* Add server button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="w-12 h-12 rounded-2xl bg-gray-800 text-green-400
                   flex items-center justify-center text-2xl font-light
                   hover:bg-green-600 hover:text-white hover:rounded-xl
                   transition-all duration-200 shadow-lg hover:shadow-green-500/30"
        title="Add a Server"
      >
        +
      </button>

      {/* Create server modal */}
      <CreateServerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
