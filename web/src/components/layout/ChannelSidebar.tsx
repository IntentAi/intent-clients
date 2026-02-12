/**
 * Channel sidebar - middle panel showing channels for selected server.
 */

import { useServerStore } from '../../stores/serverStore'
import { useChannelStore } from '../../stores/channelStore'
import { ChannelType } from '../../types/channel'

export default function ChannelSidebar() {
  const { selectedServerId, servers } = useServerStore()
  const { channelsByServer, selectedChannelId, selectChannel } = useChannelStore()

  const selectedServer = selectedServerId ? servers[selectedServerId] : null
  const channels = selectedServerId
    ? Object.values(channelsByServer[selectedServerId] || {}).sort(
        (a, b) => a.position - b.position,
      )
    : []

  if (!selectedServer) {
    return (
      <div className="w-60 bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Select a server</p>
      </div>
    )
  }

  return (
    <div className="w-60 bg-gray-900 flex flex-col">
      {/* Server header */}
      <div className="h-12 px-4 flex items-center border-b border-gray-950/50 shadow-lg">
        <h2 className="font-semibold text-white truncate">{selectedServer.name}</h2>
        <button
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          title="Server menu"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto py-2">
        {channels.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500 text-sm mb-2">No channels yet</p>
            <button className="text-indigo-400 text-sm hover:underline">
              Create one
            </button>
          </div>
        ) : (
          channels.map((channel) => {
            if (channel.type === ChannelType.CATEGORY) {
              return (
                <div
                  key={channel.id}
                  className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >
                  {channel.name}
                </div>
              )
            }

            const isSelected = selectedChannelId === channel.id
            const isVoice = channel.type === ChannelType.VOICE

            return (
              <button
                key={channel.id}
                onClick={() => selectChannel(channel.id)}
                className={`
                  w-full px-2 mx-2 py-1.5 rounded flex items-center gap-2
                  transition-colors group
                  ${
                    isSelected
                      ? 'bg-gray-700/50 text-white'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }
                `}
              >
                {/* Channel icon */}
                <span className="text-gray-500 group-hover:text-gray-300">
                  {isVoice ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-lg font-light">#</span>
                  )}
                </span>

                {/* Channel name */}
                <span className="flex-1 text-left text-sm font-medium truncate">
                  {channel.name}
                </span>

                {/* Hover actions */}
                {!isVoice && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      className="p-1 hover:bg-gray-700 rounded"
                      title="Invite"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                    </button>
                    <button
                      className="p-1 hover:bg-gray-700 rounded"
                      title="Settings"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Create channel button */}
      <div className="p-2 border-t border-gray-950/50">
        <button
          className="w-full py-2 px-3 rounded bg-gray-800/50 text-gray-300
                     hover:bg-gray-800 hover:text-white transition-colors
                     flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Channel
        </button>
      </div>
    </div>
  )
}
