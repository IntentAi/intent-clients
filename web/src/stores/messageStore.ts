/**
 * Message store.
 * Manages messages per channel with pagination support.
 * Data is normalized: messages grouped by channel ID.
 */

import { create } from 'zustand'
import type { Message } from '../types/message'

interface MessageState {
  // Messages grouped by channel ID: { channelId: { messageId: Message } }
  messagesByChannel: Record<string, Record<string, Message>>

  // Pagination cursors per channel (oldest message ID currently loaded)
  oldestMessageId: Record<string, string | null>

  // Track if we've reached the beginning of history for a channel
  hasReachedStart: Record<string, boolean>

  setMessages: (channelId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  prependMessages: (channelId: string, messages: Message[]) => void
  removeMessage: (channelId: string, messageId: string) => void
  updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void
  getMessagesForChannel: (channelId: string) => Message[]
  setOldestMessageId: (channelId: string, messageId: string | null) => void
  getOldestMessageId: (channelId: string) => string | null
  markChannelStart: (channelId: string) => void
  hasReachedChannelStart: (channelId: string) => boolean
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByChannel: {},
  oldestMessageId: {},
  hasReachedStart: {},

  setMessages: (channelId: string, messages: Message[]) => {
    const messagesMap = messages.reduce(
      (acc, message) => {
        acc[message.id] = message
        return acc
      },
      {} as Record<string, Message>,
    )

    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: messagesMap,
      },
    }))

    // Update oldest message ID if messages exist
    if (messages.length > 0) {
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      set((state) => ({
        oldestMessageId: {
          ...state.oldestMessageId,
          [channelId]: sortedMessages[0].id,
        },
      }))
    }
  },

  addMessage: (message: Message) => {
    set((state) => {
      const channelMessages = state.messagesByChannel[message.channel_id] || {}
      return {
        messagesByChannel: {
          ...state.messagesByChannel,
          [message.channel_id]: {
            ...channelMessages,
            [message.id]: message,
          },
        },
      }
    })
  },

  prependMessages: (channelId: string, messages: Message[]) => {
    if (messages.length === 0) {
      // No more messages, mark as reached start
      set((state) => ({
        hasReachedStart: {
          ...state.hasReachedStart,
          [channelId]: true,
        },
      }))
      return
    }

    set((state) => {
      const channelMessages = state.messagesByChannel[channelId] || {}
      const newMessages = messages.reduce(
        (acc, message) => {
          acc[message.id] = message
          return acc
        },
        {} as Record<string, Message>,
      )

      return {
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: {
            ...newMessages,
            ...channelMessages,
          },
        },
      }
    })

    // Update oldest message ID
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    set((state) => ({
      oldestMessageId: {
        ...state.oldestMessageId,
        [channelId]: sortedMessages[0].id,
      },
    }))
  },

  removeMessage: (channelId: string, messageId: string) => {
    set((state) => {
      const channelMessages = state.messagesByChannel[channelId]
      if (!channelMessages) return state

      const { [messageId]: _, ...rest } = channelMessages
      return {
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: rest,
        },
      }
    })
  },

  updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => {
    set((state) => {
      const channelMessages = state.messagesByChannel[channelId]
      const message = channelMessages?.[messageId]
      if (!message) return state

      return {
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: {
            ...channelMessages,
            [messageId]: { ...message, ...updates },
          },
        },
      }
    })
  },

  getMessagesForChannel: (channelId: string) => {
    const channelMessages = get().messagesByChannel[channelId] || {}
    return Object.values(channelMessages).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  },

  setOldestMessageId: (channelId: string, messageId: string | null) => {
    set((state) => ({
      oldestMessageId: {
        ...state.oldestMessageId,
        [channelId]: messageId,
      },
    }))
  },

  getOldestMessageId: (channelId: string) => {
    return get().oldestMessageId[channelId] || null
  },

  markChannelStart: (channelId: string) => {
    set((state) => ({
      hasReachedStart: {
        ...state.hasReachedStart,
        [channelId]: true,
      },
    }))
  },

  hasReachedChannelStart: (channelId: string) => {
    return get().hasReachedStart[channelId] || false
  },
}))
