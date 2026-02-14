// single message display with avatar, author, and timestamp

import type { Message } from '../../types/message'

interface MessageItemProps {
  message: Message
  isGrouped: boolean // true if this is a continuation of messages from same author
}

export default function MessageItem({ message, isGrouped }: MessageItemProps) {
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

  if (isGrouped) {
    // condensed view - just content with small margin
    return (
      <div className="group hover:bg-gray-700/30 -mx-4 px-4 py-0.5">
        <div className="pl-16">
          <p className="text-gray-200 text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  // full view - avatar, name, timestamp, content
  return (
    <div className="group hover:bg-gray-700/30 -mx-4 px-4 py-2">
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
    </div>
  )
}
