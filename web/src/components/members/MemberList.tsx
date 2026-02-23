// member list sidebar panel - shows server members with owner badge

import { useState, useEffect } from 'react'
import { useServerStore } from '../../stores/serverStore'
import { getMembers } from '../../api/members'
import type { User } from '../../types/user'

// module-level cache - survives component unmount/remount on toggle
const memberCache: Record<string, User[]> = {}

export default function MemberList() {
  const { selectedServerId, servers } = useServerStore()
  const [members, setMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const server = selectedServerId ? servers[selectedServerId] : null

  useEffect(() => {
    if (!selectedServerId) return

    // use cache if available
    if (memberCache[selectedServerId]) {
      setMembers(memberCache[selectedServerId])
      return
    }

    let cancelled = false
    const fetchMembers = async () => {
      setIsLoading(true)
      try {
        const fetched = await getMembers(selectedServerId)
        if (!cancelled) {
          memberCache[selectedServerId] = fetched
          setMembers(fetched)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('failed to fetch members:', err)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchMembers()
    return () => {
      cancelled = true
    }
  }, [selectedServerId])

  if (!server) return null

  return (
    <div className="w-60 bg-gray-900 flex flex-col border-l border-gray-950/50">
      {/* Header */}
      <div className="h-12 px-4 flex items-center border-b border-gray-950/50 shadow-lg">
        <h2 className="font-semibold text-gray-300 text-sm uppercase tracking-wide">
          Members {!isLoading && members.length > 0 && (
            <span className="text-gray-500 font-normal">&mdash; {members.length}</span>
          )}
        </h2>
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500 text-sm">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500 text-sm">No members found</p>
          </div>
        ) : (
          members.map((member) => {
            const isOwner = member.id === server.owner_id

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-1.5 mx-2 rounded
                           hover:bg-gray-800/50 transition-colors"
              >
                {/* Avatar */}
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.username}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Name and owner badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-300 truncate">
                      {member.display_name || member.username}
                    </span>
                    {isOwner && (
                      <svg
                        className="w-4 h-4 text-yellow-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <title>Server Owner</title>
                        <path
                          fillRule="evenodd"
                          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
