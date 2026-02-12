/**
 * AppShell - Main 3-panel layout container.
 * The core layout structure for the authenticated app.
 */

import ServerSidebar from './ServerSidebar'
import ChannelSidebar from './ChannelSidebar'
import { useChannelStore } from '../../stores/channelStore'

export default function AppShell() {
  const { selectedChannelId } = useChannelStore()

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">
      {/* Left panel - Server list */}
      <ServerSidebar />

      {/* Middle panel - Channel list */}
      <ChannelSidebar />

      {/* Right panel - Main content area */}
      <div className="flex-1 flex flex-col bg-gray-800">
        {selectedChannelId ? (
          <>
            {/* Channel header */}
            <div className="h-12 px-4 flex items-center border-b border-gray-900/50 shadow-lg bg-gray-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xl font-light">#</span>
                <h1 className="font-semibold text-white">
                  channel-name
                </h1>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {/* Header actions */}
                <button
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700/50"
                  title="Members"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700/50"
                  title="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Messages will go here (Phase 1 - issue #9) */}
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    This is the start of your conversation
                  </p>
                  <p className="text-gray-500 text-xs">
                    Messages and chat UI coming in Phase 1
                  </p>
                </div>
              </div>
            </div>

            {/* Message input */}
            <div className="p-4">
              <div className="bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600/30 focus-within:border-indigo-500/50 transition-colors">
                <input
                  type="text"
                  placeholder="Message #channel-name"
                  className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
                  disabled
                />
              </div>
            </div>
          </>
        ) : (
          // No channel selected
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-indigo-400/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                Welcome to Intent
              </h3>
              <p className="text-gray-500 text-sm">
                Select a channel to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
