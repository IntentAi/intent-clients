// message input with enter to send, shift+enter for newline

import { useState, useRef, KeyboardEvent } from 'react'
import { useChannelStore } from '../../stores/channelStore'
import { useServerStore } from '../../stores/serverStore'
import { useMessageStore } from '../../stores/messageStore'
import { sendMessage } from '../../api/messages'
import type { Message } from '../../types/message'

export default function MessageInput() {
  const { selectedChannelId, channelsByServer } = useChannelStore()
  const { selectedServerId } = useServerStore()
  const { addMessage } = useMessageStore()
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // direct O(1) lookup instead of flatMapping all servers
  const selectedChannel = selectedServerId && selectedChannelId
    ? channelsByServer[selectedServerId]?.[selectedChannelId] ?? null
    : null

  const handleSubmit = async () => {
    if (!content.trim() || !selectedChannelId || isSending) return

    const messageContent = content.trim()
    setContent('')
    setIsSending(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      channel_id: selectedChannelId,
      author: {
        id: 'temp',
        username: 'You',
        display_name: 'You',
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
      content: messageContent,
      created_at: new Date().toISOString(),
      edited_at: null,
    }

    try {
      addMessage(tempMessage)
      const sentMessage = await sendMessage(selectedChannelId, messageContent)

      const { removeMessage } = useMessageStore.getState()
      removeMessage(selectedChannelId, tempId)
      addMessage(sentMessage)
    } catch (err) {
      console.error('failed to send message:', err)
      const { removeMessage } = useMessageStore.getState()
      removeMessage(selectedChannelId, tempId)
      setContent(messageContent)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // auto-resize textarea as user types
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    const target = e.target
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`
  }

  return (
    <div className="p-4">
      <div className="bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600/30 focus-within:border-indigo-500/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedChannel
              ? `Message #${selectedChannel.name}`
              : 'Select a channel to start chatting'
          }
          disabled={!selectedChannelId || isSending}
          rows={1}
          className="w-full bg-transparent text-white placeholder-gray-400 outline-none resize-none overflow-hidden disabled:opacity-50"
        />
      </div>
      {content.trim() && (
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      )}
    </div>
  )
}
