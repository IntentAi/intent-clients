// server settings - rename and delete

import { useState } from 'react'
import Modal from '../common/Modal'
import { updateServer, deleteServer } from '../../api/servers'
import { useServerStore } from '../../stores/serverStore'
import { useChannelStore } from '../../stores/channelStore'
import { useAuthStore } from '../../stores/authStore'
import type { Server } from '../../types/server'

interface ServerSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  server: Server
}

export default function ServerSettingsModal({
  isOpen,
  onClose,
  server,
}: ServerSettingsModalProps) {
  const [name, setName] = useState(server.name)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.id === server.owner_id

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = name.trim()
    if (!trimmed) {
      setError('Server name is required')
      return
    }
    if (trimmed.length < 2) {
      setError('Server name must be at least 2 characters')
      return
    }
    if (trimmed.length > 100) {
      setError('Server name must be 100 characters or less')
      return
    }
    if (trimmed === server.name) {
      onClose()
      return
    }

    setIsLoading(true)
    try {
      const updated = await updateServer(server.id, { name: trimmed })
      useServerStore.getState().updateServer(server.id, updated)
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update server')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== server.name) return

    setIsLoading(true)
    setError(null)
    try {
      await deleteServer(server.id)
      useChannelStore.getState().clearServerChannels(server.id)
      useServerStore.getState().removeServer(server.id)
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to delete server')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    setName(server.name)
    setError(null)
    setConfirmDelete(false)
    setDeleteConfirmText('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Server Settings">
      {!confirmDelete ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="server-name-edit"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Server Name
            </label>
            <input
              id="server-name-edit"
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded px-3 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            {isOwner ? (
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
                Delete Server
              </button>
            ) : (
              <div />
            )}

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
                disabled={isLoading || !name.trim() || name.trim() === server.name}
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
              This will permanently delete <strong>{server.name}</strong> and all its channels and
              messages. This cannot be undone.
            </p>
          </div>

          <div>
            <label
              htmlFor="delete-confirm"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Type <strong className="text-white">{server.name}</strong> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded
                       text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
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
                setDeleteConfirmText('')
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
              disabled={isLoading || deleteConfirmText !== server.name}
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
                'Delete Server'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
