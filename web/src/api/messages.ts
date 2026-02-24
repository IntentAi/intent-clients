// message api functions

import { post, get, patch, del } from './client'
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
// pass `before` to paginate backwards from a given message ID
export async function getMessages(
  channelId: string,
  limit: number = 50,
  before?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (before) params.set('before', before)
  const response = await get<GetMessagesResponse>(
    `/channels/${channelId}/messages?${params.toString()}`
  )
  return response.messages
}

// PATCH /messages/:messageId - edit a message
export async function editMessage(
  messageId: string,
  content: string,
): Promise<Message> {
  return patch<Message>(`/messages/${messageId}`, { content })
}

// DELETE /messages/:messageId - delete a message
export async function deleteMessage(messageId: string): Promise<void> {
  await del(`/messages/${messageId}`)
}

