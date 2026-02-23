// invite api functions

import { post, get, del } from './client'

export interface Invite {
  code: string
  server_id: string
  channel_id: string | null
  inviter: { id: string; username: string }
  max_uses: number | null
  uses: number
  max_age_seconds: number | null
  created_at: string
  expires_at: string | null
}

interface JoinServerResponse {
  server: {
    id: string
    name: string
    owner_id: string
    icon_hash: string | null
  }
  channel_id: string | null
}

// POST /servers/:serverId/invites - create an invite
export async function createInvite(serverId: string): Promise<Invite> {
  return post<Invite>(`/servers/${serverId}/invites`, {})
}

// GET /servers/:serverId/invites - list all invites for a server
export async function getInvites(serverId: string): Promise<Invite[]> {
  return get<Invite[]>(`/servers/${serverId}/invites`)
}

// POST /invites/:code - join a server using an invite code
export async function joinServer(code: string): Promise<JoinServerResponse> {
  return post<JoinServerResponse>(`/invites/${code}`)
}

// DELETE /invites/:code - revoke an invite
export async function revokeInvite(code: string): Promise<void> {
  await del(`/invites/${code}`)
}
