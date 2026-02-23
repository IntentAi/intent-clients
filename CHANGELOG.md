# Changelog

## [Unreleased]

### Auth & Session
- Login and register with persistent sessions across page refresh
- Gateway auto-connects on hydrated session
- Logout clears local state and disconnects gateway

### User
- User bar at the bottom of the sidebar with avatar, username, and logout
- Profile editing (display name, etc.)

### Servers
- Server settings modal with rename and delete (owner only)

### Channels
- Channel settings modal with rename and delete
- Channel type selection (text/voice) on create

### Messages
- Inline edit and delete with hover action bar
- Delete confirmation dialog
- Real-time updates for edits and deletes

### Members
- Member list sidebar panel with role display
- Members fetched per-server via REST

### Invites
- Invite button on channel hover generates a shareable link
- InviteModal calls the server API and copies the URL to clipboard
- `/invite/:code` route handles the join flow
- Unauthenticated users get redirected to login/register with a bounce-back
- Error handling for expired, invalid, and already-a-member invites
- Invite codes cached per server to avoid burning new ones on repeated opens

### Gateway
- Heartbeat miss detection switched to awaitingAck flag (replaces timestamp-based check)

### Infra
- ESLint 9 compatibility fix
- CI workflow for lint, type check, and build

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
