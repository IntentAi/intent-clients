/**
 * Channel store.
 * Manages channels per server and current channel selection.
 * Data is normalized: channels grouped by server ID.
 */

import { create } from 'zustand'
import type { Channel } from '../types/channel'

interface ChannelState {
  // Channels grouped by server ID: { serverId: { channelId: Channel } }
  channelsByServer: Record<string, Record<string, Channel>>
  selectedChannelId: string | null

  setChannels: (serverId: string, channels: Channel[]) => void
  addChannel: (channel: Channel) => void
  removeChannel: (serverId: string, channelId: string) => void
  updateChannel: (serverId: string, channelId: string, updates: Partial<Channel>) => void
  selectChannel: (channelId: string | null) => void
  getChannel: (serverId: string, channelId: string) => Channel | undefined
  getChannelsForServer: (serverId: string) => Channel[]
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  channelsByServer: {},
  selectedChannelId: null,

  setChannels: (serverId: string, channels: Channel[]) => {
    const channelsMap = channels.reduce(
      (acc, channel) => {
        acc[channel.id] = channel
        return acc
      },
      {} as Record<string, Channel>,
    )
    set((state) => ({
      channelsByServer: {
        ...state.channelsByServer,
        [serverId]: channelsMap,
      },
    }))
  },

  addChannel: (channel: Channel) => {
    set((state) => {
      const serverChannels = state.channelsByServer[channel.server_id] || {}
      return {
        channelsByServer: {
          ...state.channelsByServer,
          [channel.server_id]: {
            ...serverChannels,
            [channel.id]: channel,
          },
        },
      }
    })
  },

  removeChannel: (serverId: string, channelId: string) => {
    set((state) => {
      const serverChannels = state.channelsByServer[serverId]
      if (!serverChannels) return state

      const { [channelId]: _, ...rest } = serverChannels
      return {
        channelsByServer: {
          ...state.channelsByServer,
          [serverId]: rest,
        },
        selectedChannelId: state.selectedChannelId === channelId ? null : state.selectedChannelId,
      }
    })
  },

  updateChannel: (serverId: string, channelId: string, updates: Partial<Channel>) => {
    set((state) => {
      const serverChannels = state.channelsByServer[serverId]
      const channel = serverChannels?.[channelId]
      if (!channel) return state

      return {
        channelsByServer: {
          ...state.channelsByServer,
          [serverId]: {
            ...serverChannels,
            [channelId]: { ...channel, ...updates },
          },
        },
      }
    })
  },

  selectChannel: (channelId: string | null) => {
    set({ selectedChannelId: channelId })
  },

  getChannel: (serverId: string, channelId: string) => {
    return get().channelsByServer[serverId]?.[channelId]
  },

  getChannelsForServer: (serverId: string) => {
    const serverChannels = get().channelsByServer[serverId] || {}
    return Object.values(serverChannels).sort((a, b) => a.position - b.position)
  },
}))
