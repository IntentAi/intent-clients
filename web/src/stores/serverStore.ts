/**
 * Server store.
 * Manages user's servers and current server selection.
 */

import { create } from 'zustand'
import type { Server } from '../types/server'
import { gatewayClient, SERVER_CREATE } from '../gateway'

interface ServerState {
  servers: Record<string, Server>
  selectedServerId: string | null

  setServers: (servers: Server[]) => void
  addServer: (server: Server) => void
  removeServer: (serverId: string) => void
  updateServer: (serverId: string, updates: Partial<Server>) => void
  selectServer: (serverId: string | null) => void
  getServer: (serverId: string) => Server | undefined
  getServersList: () => Server[]
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: {},
  selectedServerId: null,

  setServers: (servers: Server[]) => {
    const serversMap = servers.reduce(
      (acc, server) => {
        acc[server.id] = server
        return acc
      },
      {} as Record<string, Server>,
    )
    set({ servers: serversMap })
  },

  addServer: (server: Server) => {
    set((state) => ({
      servers: { ...state.servers, [server.id]: server },
    }))
  },

  removeServer: (serverId: string) => {
    set((state) => {
      const { [serverId]: _, ...rest } = state.servers
      return {
        servers: rest,
        selectedServerId: state.selectedServerId === serverId ? null : state.selectedServerId,
      }
    })
  },

  updateServer: (serverId: string, updates: Partial<Server>) => {
    set((state) => {
      const server = state.servers[serverId]
      if (!server) return state
      return {
        servers: {
          ...state.servers,
          [serverId]: { ...server, ...updates },
        },
      }
    })
  },

  selectServer: (serverId: string | null) => {
    set({ selectedServerId: serverId })
  },

  getServer: (serverId: string) => {
    return get().servers[serverId]
  },

  getServersList: () => {
    return Object.values(get().servers)
  },
}))

// handle SERVER_CREATE events from gateway
gatewayClient.on<{ server: Server }>(SERVER_CREATE, (payload) => {
  const { addServer, getServer } = useServerStore.getState()
  const existingServer = getServer(payload.server.id)

  // skip if we already have it from optimistic update
  if (existingServer) {
    console.log('[ServerStore] SERVER_CREATE: already exists, skipping')
    return
  }

  // new server (probably invited to it)
  console.log('[ServerStore] SERVER_CREATE: adding', payload.server.name)
  addServer(payload.server)
})

// populate servers from READY event on connect
gatewayClient.on<{ servers: Server[] }>('READY', (payload) => {
  const { setServers } = useServerStore.getState()
  console.log('[ServerStore] READY: got', payload.servers.length, 'servers')
  setServers(payload.servers)
})
