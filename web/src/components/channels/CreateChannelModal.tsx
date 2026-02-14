// form for creating a new channel

import { useState } from 'react'
import Modal from '../common/Modal'
import { createChannel } from '../../api/channels'
import { useChannelStore } from '../../stores/channelStore'
import { ChannelType, type Channel } from '../../types/channel'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  serverId,
}: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ChannelType>(ChannelType.TEXT)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addChannel } = useChannelStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Channel name is required')
      return
    }
    if (name.length > 100) {
      setError('Channel name must be 100 characters or less')
      return
    }

    setIsLoading(true)

    const tempId = `temp-${Date.now()}`
    const tempChannel: Channel = {
      id: tempId,
      server_id: serverId,
      name: name.trim(),
      type,
      topic: null,
      position: 999,
      parent_id: null,
      created_at: new Date().toISOString(),
    }

    try {
      addChannel(tempChannel)
      const createdChannel = await createChannel(serverId, name.trim(), type)

      const { removeChannel } = useChannelStore.getState()
      removeChannel(serverId, tempId)
      addChannel(createdChannel)

      setName('')
      setType(ChannelType.TEXT)
      onClose()
    } catch (err) {
      const { removeChannel } = useChannelStore.getState()
      removeChannel(serverId, tempId)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create channel. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setType(ChannelType.TEXT)
      setError(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="channel-name" className="block text-sm font-medium text-gray-300 mb-2">
            Channel Name
          </label>
          <input
            id="channel-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="general"
            maxLength={100}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded
                     text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
          <p className="mt-1 text-xs text-gray-500">
            {name.length}/100 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Channel Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType(ChannelType.TEXT)}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-3 rounded border-2 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  type === ChannelType.TEXT
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">#</span>
                <span className="font-medium">Text</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setType(ChannelType.VOICE)}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-3 rounded border-2 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  type === ChannelType.VOICE
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Voice</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded px-3 py-2">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
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
                Creating...
              </>
            ) : (
              'Create Channel'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
