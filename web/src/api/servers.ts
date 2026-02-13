// server api functions

import { post, get } from './client'
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

// TODO: getServer, deleteServer, updateServer - add these when we need server settings
