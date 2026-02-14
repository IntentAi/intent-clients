// channel api functions

import { post, get } from './client'
import type { Channel, ChannelType } from '../types/channel'

interface CreateChannelRequest {
  name: string
  type: ChannelType
}

interface GetChannelsResponse {
  channels: Channel[]
}

// POST /servers/:serverId/channels - create a new channel
export async function createChannel(
  serverId: string,
  name: string,
  type: ChannelType
): Promise<Channel> {
  const body: CreateChannelRequest = { name, type }
  return post<Channel>(`/servers/${serverId}/channels`, body)
}

// GET /servers/:serverId/channels - fetch all channels for a server
export async function getChannels(serverId: string): Promise<Channel[]> {
  const response = await get<GetChannelsResponse>(`/servers/${serverId}/channels`)
  return response.channels
}

// TODO: getChannel(channelId), deleteChannel(channelId) - add when we need channel settings
