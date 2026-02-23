// single message display with avatar, author, timestamp, edit/delete actions

import { useState, useRef, useEffect } from 'react'
import type { Message } from '../../types/message'
import { useAuthStore } from '../../stores/authStore'
import { useMessageStore } from '../../stores/messageStore'
import { editMessage, deleteMessage } from '../../api/messages'

interface MessageItemProps {
  message: Message
  isGrouped: boolean // true if this is a continuation of messages from same author
}

export default function MessageItem({ message, isGrouped }: MessageItemProps) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwnMessage = currentUser?.id === message.author.id

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const editRef = useRef<HTMLTextAreaElement>(null)

  // auto-focus and auto-resize textarea when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      const ta = editRef.current
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    }
  }, [isEditing])

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

  const startEdit = () => {
    setEditContent(message.content)
    setEditError(null)
    setIsEditing(true)
    setConfirmingDelete(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditContent(message.content)
    setEditError(null)
  }

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim()
    if (!trimmed) {
      setEditError('Message cannot be empty')
      return
    }
    if (trimmed === message.content) {
      cancelEdit()
      return
    }

    setIsSaving(true)
    setEditError(null)
    try {
      const updated = await editMessage(message.id, trimmed)
      useMessageStore.getState().updateMessage(message.channel_id, message.id, updated)
      setIsEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to edit message')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteMessage(message.id)
      useMessageStore.getState().removeMessage(message.channel_id, message.id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete message')
    } finally {
      setIsDeleting(false)
    }
  }

  // edit textarea replaces message content
  const editArea = (
    <div className="space-y-1">
      <textarea
        ref={editRef}
        value={editContent}
        onChange={(e) => {
          setEditContent(e.target.value)
          e.target.style.height = 'auto'
          e.target.style.height = e.target.scrollHeight + 'px'
        }}
        onKeyDown={handleEditKeyDown}
        disabled={isSaving}
        rows={1}
        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded
                   text-gray-200 text-sm resize-none leading-relaxed
                   focus:outline-none focus:border-indigo-500
                   disabled:opacity-50"
      />
      {editError && (
        <p className="text-xs text-red-400">{editError}</p>
      )}
      <p className="text-xs text-gray-500">
        escape to{' '}
        <button
          onClick={cancelEdit}
          className="text-indigo-400 hover:underline"
          disabled={isSaving}
        >
          cancel
        </button>
        {' '}&middot; enter to{' '}
        <button
          onClick={handleSaveEdit}
          className="text-indigo-400 hover:underline"
          disabled={isSaving}
        >
          save
        </button>
      </p>
    </div>
  )

  // inline delete confirmation
  const deleteConfirm = (
    <div className="mt-1 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Delete this message?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700
                     transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
        <button
          onClick={() => {
            setConfirmingDelete(false)
            setDeleteError(null)
          }}
          disabled={isDeleting}
          className="text-xs px-2 py-0.5 text-gray-400 hover:text-white transition-colors
                     disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {deleteError && (
        <p className="text-xs text-red-400">{deleteError}</p>
      )}
    </div>
  )

  // hover action bar - edit and delete for own messages (hidden during edit/delete)
  const actionBar = isOwnMessage && !isEditing && !confirmingDelete ? (
    <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                    bg-gray-800 border border-gray-700 rounded shadow-lg flex">
      <button
        onClick={startEdit}
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
        onClick={() => {
          setConfirmingDelete(true)
          setDeleteError(null)
          setIsEditing(false)
        }}
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

  // message content or edit area depending on state
  const messageBody = isEditing ? editArea : (
    <>
      <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>
      {confirmingDelete && deleteConfirm}
    </>
  )

  if (isGrouped) {
    // condensed view - just content with small margin
    return (
      <div className="group relative hover:bg-gray-700/30 -mx-4 px-4 py-0.5">
        <div className="pl-16">
          {messageBody}
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

          {/* Message content or edit area */}
          {messageBody}
        </div>
      </div>
      {actionBar}
    </div>
  )
}
