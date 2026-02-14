# Changelog

## [0.1.0] - 2026-02-13

### What's New

**Servers**
- Create and list servers
- Real-time updates when servers are created

**Channels**
- Create text and voice channels
- Channels load automatically when you select a server
- Real-time updates when channels are created

**Messages**
- Send and receive messages with instant feedback
- Messages auto-scroll to bottom (or show "new messages" button if you scrolled up)
- Consecutive messages from the same author are grouped together
- Real-time updates for new/edited/deleted messages

**Under the Hood**
- WebSocket gateway with MessagePack protocol for fast real-time updates
- Fixed race conditions in optimistic updates that caused ghost entries
- Fixed memory leak in modal component
- Added request cancellation to prevent stale data when switching contexts

### Tech Stack
React 18 + TypeScript + Vite + Zustand + Tailwind CSS
