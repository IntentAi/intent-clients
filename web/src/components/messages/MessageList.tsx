// scrollable message list with auto-scroll and grouping logic

import { useEffect, useRef, useState } from 'react'
import { useMessageStore } from '../../stores/messageStore'
import { useChannelStore } from '../../stores/channelStore'
import { getMessages } from '../../api/messages'
import MessageItem from './MessageItem'

export default function MessageList() {
  const { selectedChannelId } = useChannelStore()
  const {
    messagesByChannel,
    setMessages,
    prependMessages,
    getMessagesForChannel,
    getOldestMessageId,
    hasReachedChannelStart,
  } = useMessageStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showNewMessages, setShowNewMessages] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)
  const isNearBottomRef = useRef(true)
  const isFetchingMoreRef = useRef(false)

  const messages = selectedChannelId ? getMessagesForChannel(selectedChannelId) : []

  // fetch messages when channel changes
  useEffect(() => {
    if (!selectedChannelId) return

    // reset load-more lock on channel switch
    isFetchingMoreRef.current = false

    if (messagesByChannel[selectedChannelId]) {
      scrollToBottom()
      return
    }

    let cancelled = false
    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        const fetchedMessages = await getMessages(selectedChannelId)
        if (!cancelled) {
          setMessages(selectedChannelId, fetchedMessages)
          setTimeout(() => scrollToBottom(), 100)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('failed to fetch messages:', err)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchMessages()
    return () => {
      cancelled = true
    }
  }, [selectedChannelId, messagesByChannel, setMessages])

  // auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      if (isNearBottomRef.current) {
        scrollToBottom()
      } else {
        setShowNewMessages(true)
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length])

  // fetch older messages using the oldest known message ID as cursor
  const loadMoreMessages = async () => {
    if (!selectedChannelId) return
    if (isFetchingMoreRef.current) return
    if (hasReachedChannelStart(selectedChannelId)) return

    const before = getOldestMessageId(selectedChannelId)
    if (!before) return

    isFetchingMoreRef.current = true
    setIsLoadingMore(true)

    // snapshot scroll position so we can restore it after prepending
    const container = scrollRef.current
    const scrollHeightBefore = container?.scrollHeight ?? 0

    try {
      const older = await getMessages(selectedChannelId, 50, before)
      prependMessages(selectedChannelId, older)

      // restore scroll position — shift by how much height was added at top
      if (container) {
        const added = container.scrollHeight - scrollHeightBefore
        container.scrollTop += added
      }
    } catch (err) {
      console.error('failed to load older messages:', err)
    } finally {
      setIsLoadingMore(false)
      isFetchingMoreRef.current = false
    }
  }

  // track scroll position and trigger pagination near top
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    isNearBottomRef.current = distanceFromBottom < 100
    if (isNearBottomRef.current) {
      setShowNewMessages(false)
    }
    if (scrollTop < 100) {
      loadMoreMessages()
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      setShowNewMessages(false)
      isNearBottomRef.current = true
    }
  }

  // group messages from same author within 5 minutes
  const groupedMessages = messages.map((msg, index) => {
    if (index === 0) return { message: msg, isGrouped: false }

    const prevMsg = messages[index - 1]
    const isSameAuthor = prevMsg.author.id === msg.author.id
    const timeDiff = new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
    const isWithin5Min = timeDiff < 5 * 60 * 1000

    return {
      message: msg,
      isGrouped: isSameAuthor && isWithin5Min,
    }
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No messages yet</p>
          <p className="text-gray-500 text-xs mt-1">Be the first to say something!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto px-4 py-4"
      >
        {/* top-of-history markers */}
        {selectedChannelId && hasReachedChannelStart(selectedChannelId) && (
          <div className="text-center py-4 mb-2">
            <p className="text-gray-500 text-xs">Beginning of conversation</p>
          </div>
        )}
        {isLoadingMore && (
          <div className="text-center py-3">
            <p className="text-gray-500 text-xs">Loading older messages...</p>
          </div>
        )}

        {groupedMessages.map(({ message, isGrouped }) => (
          <MessageItem key={message.id} message={message} isGrouped={isGrouped} />
        ))}
      </div>

      {/* New messages indicator */}
      {showNewMessages && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={scrollToBottom}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            New messages
          </button>
        </div>
      )}
    </div>
  )
}
