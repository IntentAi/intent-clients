// message store - manages messages per channel with pagination

import { create } from 'zustand'
import type { Message } from '../types/message'
import { gatewayClient, MESSAGE_CREATE, MESSAGE_UPDATE, MESSAGE_DELETE } from '../gateway'

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
  replaceMessage: (channelId: string, oldId: string, message: Message) => void
  removeMessage: (channelId: string, messageId: string) => void
  updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void
  getMessagesForChannel: (channelId: string) => Message[]
  getOldestMessageId: (channelId: string) => string | null
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

    set((state) => {
      const update: Partial<MessageState> = {
        messagesByChannel: { ...state.messagesByChannel, [channelId]: messagesMap },
        // clear pagination state when a channel's messages are reset
        hasReachedStart: { ...state.hasReachedStart, [channelId]: false },
      }
      if (messages.length > 0) {
        const oldest = [...messages].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )[0]
        update.oldestMessageId = { ...state.oldestMessageId, [channelId]: oldest.id }
      }
      return update
    })
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

  // atomically swap a temp optimistic message for the real one — no render between remove and add
  replaceMessage: (channelId: string, oldId: string, message: Message) => {
    set((state) => {
      const channelMessages = state.messagesByChannel[channelId]
      if (!channelMessages) return state
      const { [oldId]: _, ...rest } = channelMessages
      return {
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: { ...rest, [message.id]: message },
        },
      }
    })
  },

  prependMessages: (channelId: string, messages: Message[]) => {
    if (messages.length === 0) {
      set((state) => ({
        hasReachedStart: { ...state.hasReachedStart, [channelId]: true },
      }))
      return
    }

    const newMessages = messages.reduce(
      (acc, message) => {
        acc[message.id] = message
        return acc
      },
      {} as Record<string, Message>,
    )
    const oldest = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )[0]

    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: { ...newMessages, ...state.messagesByChannel[channelId] },
      },
      oldestMessageId: { ...state.oldestMessageId, [channelId]: oldest.id },
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

  getOldestMessageId: (channelId: string) => {
    return get().oldestMessageId[channelId] || null
  },

  hasReachedChannelStart: (channelId: string) => {
    return get().hasReachedStart[channelId] || false
  },
}))

// handle MESSAGE_CREATE events from gateway
gatewayClient.on<{ message: Message }>(MESSAGE_CREATE, (payload) => {
  const { addMessage, messagesByChannel } = useMessageStore.getState()
  const channelMessages = messagesByChannel[payload.message.channel_id]

  // skip if we already have this message (from optimistic update)
  if (channelMessages && channelMessages[payload.message.id]) return

  addMessage(payload.message)
})

// handle MESSAGE_UPDATE events
gatewayClient.on<{ message: Message }>(MESSAGE_UPDATE, (payload) => {
  const { updateMessage } = useMessageStore.getState()
  updateMessage(payload.message.channel_id, payload.message.id, payload.message)
})

// handle MESSAGE_DELETE events
gatewayClient.on<{ id: string; channel_id: string }>(MESSAGE_DELETE, (payload) => {
  const { removeMessage } = useMessageStore.getState()
  removeMessage(payload.channel_id, payload.id)
})
