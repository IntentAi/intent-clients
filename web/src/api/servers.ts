// server api functions

import { post, get, patch, del } from './client'
import type { Server } from '../types/server'

interface CreateServerRequest {
  name: string
}

interface GetServersResponse {
  servers: Server[]
}

// POST /servers - create a new server
export async function createServer(name: string): Promise<Server> {
  const body: CreateServerRequest = { name }
  return post<Server>('/servers', body)
}

// GET /servers - fetch all servers
// note: servers are usually populated from the gateway Ready event,
// this is mainly for manual refresh
export async function getServers(): Promise<Server[]> {
  const response = await get<GetServersResponse>('/servers')
  return response.servers
}

// PATCH /servers/:serverId - update server name/description
export async function updateServer(
  serverId: string,
  updates: { name?: string; description?: string },
): Promise<Server> {
  return patch<Server>(`/servers/${serverId}`, updates)
}

// DELETE /servers/:serverId - delete a server (owner only)
export async function deleteServer(serverId: string): Promise<void> {
  await del(`/servers/${serverId}`)
}
