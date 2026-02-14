// message api functions

import { post, get } from './client'
import type { Message } from '../types/message'

interface SendMessageRequest {
  content: string
}

interface GetMessagesResponse {
  messages: Message[]
}

// POST /channels/:channelId/messages - send a message
export async function sendMessage(channelId: string, content: string): Promise<Message> {
  const body: SendMessageRequest = { content }
  return post<Message>(`/channels/${channelId}/messages`, body)
}

// GET /channels/:channelId/messages - fetch message history
export async function getMessages(
  channelId: string,
  limit: number = 50
): Promise<Message[]> {
  const response = await get<GetMessagesResponse>(
    `/channels/${channelId}/messages?limit=${limit}`
  )
  return response.messages
}

// TODO: pagination with before/after cursors - add when we implement scroll-to-load-more
