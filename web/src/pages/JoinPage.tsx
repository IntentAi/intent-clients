// join page - handles /invite/:code route

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { joinServer } from '../api/invites'
import { useServerStore } from '../stores/serverStore'
import { useAuthStore } from '../stores/authStore'
import { ApiError } from '../types/api'

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { addServer, selectServer } = useServerStore()

  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!code || !isAuthenticated) return

    let cancelled = false
    const join = async () => {
      try {
        const result = await joinServer(code)
        if (cancelled) return

        addServer({
          id: result.server.id,
          name: result.server.name,
          owner_id: result.server.owner_id,
          icon_url: result.server.icon_hash,
          member_count: 1,
          created_at: new Date().toISOString(),
        })
        selectServer(result.server.id)
        navigate('/', { replace: true })
      } catch (err) {
        if (cancelled) return
        setStatus('error')

        if (err instanceof ApiError) {
          if (err.status === 404) {
            setError('This invite link is invalid or has been revoked.')
          } else if (err.status === 410) {
            setError('This invite has expired or reached its usage limit.')
          } else if (err.status === 409) {
            setError("You're already a member of this server.")
            redirectTimer.current = setTimeout(() => {
              if (!cancelled) navigate('/', { replace: true })
            }, 1500)
          } else {
            setError(err.message || 'Something went wrong.')
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to join server.')
        }
      }
    }

    join()
    return () => {
      cancelled = true
      if (redirectTimer.current) clearTimeout(redirectTimer.current)
    }
  }, [code, isAuthenticated, addServer, selectServer, navigate])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-white mb-3">You've been invited</h1>
          <p className="text-gray-400 text-sm mb-6">
            Log in or create an account to accept this invite.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to={`/login?redirect=/invite/${code}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded font-medium
                       hover:bg-indigo-700 transition-colors text-sm"
            >
              Log In
            </Link>
            <Link
              to={`/register?redirect=/invite/${code}`}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded font-medium
                       hover:bg-gray-600 transition-colors text-sm"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Invite Failed</h1>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded font-medium
                     hover:bg-indigo-700 transition-colors text-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // loading state
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-indigo-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
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
        <p className="text-gray-400 text-sm">Joining server...</p>
      </div>
    </div>
  )
}
