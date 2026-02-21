// member api functions

import { get } from './client'
import type { User } from '../types/user'

interface GetMembersResponse {
  members: User[]
}

// GET /servers/:serverId/members - fetch all members for a server
export async function getMembers(serverId: string): Promise<User[]> {
  const response = await get<GetMembersResponse>(`/servers/${serverId}/members`)
  return response.members
}
