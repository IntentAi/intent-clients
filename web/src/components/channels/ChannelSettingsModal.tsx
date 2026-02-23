// channel settings - rename, topic, delete

import { useState } from 'react'
import Modal from '../common/Modal'
import { updateChannel, deleteChannel } from '../../api/channels'
import { useChannelStore } from '../../stores/channelStore'
import type { Channel } from '../../types/channel'

interface ChannelSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  channel: Channel
}

export default function ChannelSettingsModal({
  isOpen,
  onClose,
  channel,
}: ChannelSettingsModalProps) {
  const [name, setName] = useState(channel.name)
  const [topic, setTopic] = useState(channel.topic ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Channel name is required')
      return
    }
    if (trimmedName.length > 100) {
      setError('Channel name must be 100 characters or less')
      return
    }

    const trimmedTopic = topic.trim()
    if (trimmedTopic.length > 1024) {
      setError('Topic must be 1024 characters or less')
      return
    }

    // nothing changed
    const nameChanged = trimmedName !== channel.name
    const topicChanged = trimmedTopic !== (channel.topic ?? '')
    if (!nameChanged && !topicChanged) {
      onClose()
      return
    }

    const updates: { name?: string; topic?: string } = {}
    if (nameChanged) updates.name = trimmedName
    if (topicChanged) updates.topic = trimmedTopic

    setIsLoading(true)
    try {
      const updated = await updateChannel(channel.id, updates)
      useChannelStore
        .getState()
        .updateChannel(channel.server_id, channel.id, updated)
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update channel')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteChannel(channel.id)
      useChannelStore.getState().removeChannel(channel.server_id, channel.id)
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to delete channel')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    setName(channel.name)
    setTopic(channel.topic ?? '')
    setError(null)
    setConfirmDelete(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Channel Settings">
      {!confirmDelete ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="channel-name-edit"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Channel Name
            </label>
            <input
              id="channel-name-edit"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded
                       text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">{name.length}/100 characters</p>
          </div>

          <div>
            <label
              htmlFor="channel-topic-edit"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Topic
            </label>
            <textarea
              id="channel-topic-edit"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={1024}
              disabled={isLoading}
              rows={3}
              placeholder="What's this channel about?"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded
                       text-white placeholder-gray-500 resize-none
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">{topic.length}/1024 characters</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded px-3 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(true)
                setError(null)
              }}
              disabled={isLoading}
              className="px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300
                       hover:bg-red-500/10 rounded transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Channel
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded
                         hover:bg-indigo-700 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded px-4 py-3">
            <p className="text-sm text-red-400">
              This will permanently delete <strong>#{channel.name}</strong> and all its messages.
              This cannot be undone.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded px-3 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false)
                setError(null)
              }}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded
                       hover:bg-red-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Channel'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
