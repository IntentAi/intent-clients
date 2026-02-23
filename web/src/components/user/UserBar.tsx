import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { logout, updateProfile } from '../../api/auth'

export default function UserBar() {
  const { user, logout: clearAuth, setUser } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  if (!user) return null

  const initials = (user.display_name || user.username)
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // server-side session invalidation best-effort; clear local state regardless
    }
    clearAuth()
  }

  function openEdit() {
    setDisplayName(user!.display_name)
    setError(null)
    setMenuOpen(false)
    setEditOpen(true)
  }

  async function handleSave() {
    if (!displayName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateProfile({ display_name: displayName.trim() })
      setUser(updated)
      // keep localStorage in sync
      localStorage.setItem('user', JSON.stringify(updated))
      setEditOpen(false)
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div ref={menuRef} className="relative p-2 border-t border-gray-950/50">
        <div className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-800/50 transition-colors">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
            <p className="text-xs text-gray-400 truncate">@{user.username}</p>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title="User settings"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
            <button
              onClick={openEdit}
              className="w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-700 transition-colors"
            >
              Edit Profile
            </button>
            <div className="h-px bg-gray-700" />
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-gray-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Edit profile modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditOpen(false)}>
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Edit Profile</h2>

            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              maxLength={32}
              autoFocus
            />

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

            <div className="flex gap-2 mt-5 justify-end">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !displayName.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
