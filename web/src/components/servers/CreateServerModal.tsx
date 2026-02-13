// form for creating a new server

import { useState } from 'react'
import Modal from '../common/Modal'
import { createServer } from '../../api/servers'
import { useServerStore } from '../../stores/serverStore'
import type { Server } from '../../types/server'

interface CreateServerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateServerModal({ isOpen, onClose }: CreateServerModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addServer } = useServerStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Server name is required')
      return
    }
    if (name.length > 100) {
      setError('Server name must be 100 characters or less')
      return
    }

    setIsLoading(true)

    try {
      // add temp server for instant ui feedback
      const tempServer: Server = {
        id: `temp-${Date.now()}`,
        name: name.trim(),
        icon_url: null,
        owner_id: 'temp',
        member_count: 1,
        created_at: new Date().toISOString(),
      }
      addServer(tempServer)

      const createdServer = await createServer(name.trim())

      // swap temp with real server
      const { removeServer } = useServerStore.getState()
      removeServer(tempServer.id)
      addServer(createdServer)

      setName('')
      onClose()
    } catch (err) {
      // remove temp server if creation failed
      const tempId = `temp-${Date.now()}`
      const { removeServer } = useServerStore.getState()
      removeServer(tempId)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create server. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setError(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Server">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="server-name" className="block text-sm font-medium text-gray-300 mb-2">
            Server Name
          </label>
          <input
            id="server-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Server"
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
              'Create Server'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
