// channel api functions

import { post, get, patch, del } from './client'
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

// PATCH /channels/:channelId - update channel name/topic/position
export async function updateChannel(
  channelId: string,
  updates: { name?: string; topic?: string; position?: number },
): Promise<Channel> {
  return patch<Channel>(`/channels/${channelId}`, updates)
}

// DELETE /channels/:channelId - delete a channel
export async function deleteChannel(channelId: string): Promise<void> {
  await del(`/channels/${channelId}`)
}
