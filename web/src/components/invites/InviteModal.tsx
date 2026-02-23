// modal for generating and sharing server invite links

import { useState, useEffect, useRef } from 'react'
import Modal from '../common/Modal'
import { createInvite, type Invite } from '../../api/invites'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
}

// cache invites per server so we don't mint a new code every time the modal opens
const inviteCache = new Map<string, Invite>()

function isCachedInviteValid(invite: Invite): boolean {
  if (!invite.expires_at) return true
  return new Date(invite.expires_at).getTime() > Date.now()
}

export default function InviteModal({ isOpen, onClose, serverId }: InviteModalProps) {
  const [invite, setInvite] = useState<Invite | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const prevServerId = useRef(serverId)

  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
      return
    }

    // clear state if server changed
    if (prevServerId.current !== serverId) {
      setInvite(null)
      setError(null)
      prevServerId.current = serverId
    }

    // reuse cached invite if it's still valid
    const cached = inviteCache.get(serverId)
    if (cached && isCachedInviteValid(cached)) {
      setInvite(cached)
      return
    }

    let cancelled = false
    const generate = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const inv = await createInvite(serverId)
        if (!cancelled) {
          inviteCache.set(serverId, inv)
          setInvite(inv)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to create invite')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    generate()
    return () => { cancelled = true }
  }, [isOpen, serverId])

  const inviteUrl = invite
    ? `${window.location.origin}/invite/${invite.code}`
    : ''

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const input = document.createElement('input')
      input.value = inviteUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite People">
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <svg className="animate-spin h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded px-3 py-2">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {invite && (
          <>
            <p className="text-sm text-gray-400">
              Share this link to invite others to the server.
              {invite.expires_at && ' This link will expire in 24 hours.'}
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded
                         text-white text-sm select-all
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className={`
                  px-4 py-2 rounded text-sm font-medium transition-colors
                  ${copied
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }
                `}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
