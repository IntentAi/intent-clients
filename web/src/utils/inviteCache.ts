// invite cache - reuses codes per server instead of minting new ones on every modal open

import type { Invite } from '../api/invites'

const cache = new Map<string, Invite>()

export function getCachedInvite(serverId: string): Invite | null {
  const invite = cache.get(serverId)
  if (!invite) return null
  if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) {
    cache.delete(serverId)
    return null
  }
  return invite
}

export function setCachedInvite(serverId: string, invite: Invite) {
  cache.set(serverId, invite)
}

export function clearInviteCache() {
  cache.clear()
}
