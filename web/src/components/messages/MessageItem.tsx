// single message display with avatar, author, and timestamp

import type { Message } from '../../types/message'
import { useAuthStore } from '../../stores/authStore'

interface MessageItemProps {
  message: Message
  isGrouped: boolean // true if this is a continuation of messages from same author
}

export default function MessageItem({ message, isGrouped }: MessageItemProps) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwnMessage = currentUser?.id === message.author.id

  // format timestamp as "Today at 3:42 PM" or "Yesterday at 10:15 AM"
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    if (isToday) return `Today at ${timeStr}`
    if (isYesterday) return `Yesterday at ${timeStr}`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }) + ` at ${timeStr}`
  }

  // hover action bar - edit and delete for own messages
  const actionBar = isOwnMessage ? (
    <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                    bg-gray-800 border border-gray-700 rounded shadow-lg flex">
      <button
        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-l
                   transition-colors"
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-r
                   transition-colors"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  ) : null

  if (isGrouped) {
    // condensed view - just content with small margin
    return (
      <div className="group relative hover:bg-gray-700/30 -mx-4 px-4 py-0.5">
        <div className="pl-16">
          <p className="text-gray-200 text-sm leading-relaxed">{message.content}</p>
        </div>
        {actionBar}
      </div>
    )
  }

  // full view - avatar, name, timestamp, content
  return (
    <div className="group relative hover:bg-gray-700/30 -mx-4 px-4 py-2">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {message.author.avatar_url ? (
            <img
              src={message.author.avatar_url}
              alt={message.author.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {message.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header - name and timestamp */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-white text-sm">
              {message.author.display_name || message.author.username}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.created_at)}
            </span>
            {message.edited_at && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>

          {/* Message content */}
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
      {actionBar}
    </div>
  )
}
