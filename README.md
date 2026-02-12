# Intent Clients

Official clients for Intent - Desktop, Web, and Mobile.

## Status

**Phase 1 Development (In Progress)** - Building web client foundation.

### Web Client Progress
- ✅ WebSocket Gateway (MessagePack protocol)
- ✅ Authentication (login/register)
- ✅ Zustand state management
- ✅ 3-panel Discord-style layout
- 🔄 Server/Channel/Message APIs (next)
- 🔄 Real-time event handling
- ⏳ End-to-end testing

## Clients

### Web (Active Development)
- **Tech**: React 18 + TypeScript + Vite + Zustand + Tailwind
- **Protocol**: REST API + WebSocket Gateway (MessagePack)
- **Deployment**: Self-hostable + hosted at app.intent.chat
- **Status**: Phase 1 (core features in progress)

### Desktop (Tauri)
- **Tech**: Rust + Tauri + native webview (shares web frontend)
- **Target RAM**: <80MB idle
- **Platforms**: Windows, macOS, Linux
- **Status**: Phase 5 (after web MVP)

### Mobile
- **iOS**: Native Swift
- **Android**: Native Kotlin
- **Status**: Phase 2+ (after desktop/web)

## Architecture

```
intent-clients/
├── web/          # Web client (React + TypeScript)
│   ├── src/
│   │   ├── api/          # REST API client
│   │   ├── gateway/      # WebSocket + MessagePack
│   │   ├── stores/       # Zustand state management
│   │   ├── components/   # React components
│   │   │   └── layout/   # 3-panel app shell
│   │   ├── pages/        # Route pages
│   │   └── types/        # TypeScript definitions
│   └── package.json
├── desktop/      # Tauri application (Phase 5)
├── mobile/       # Mobile apps (Phase 2+)
└── shared/       # Shared libs (Phase 3+)
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Web Client Setup

```bash
cd web
npm install
```

### Running Development Server

```bash
npm run dev
# Opens at http://localhost:5173
```

**Note:** Requires a running Intent server. Set `VITE_API_URL` and `VITE_GATEWAY_URL` in `.env`:

```bash
cp .env.example .env
# Edit .env with your server URLs
```

### Building for Production

```bash
npm run build
# Output in web/dist/
```

### Code Quality

```bash
npm run lint      # ESLint
npm run format    # Prettier
```

## Tech Stack (Web)

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **State**: Zustand (normalized stores)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Protocol**: MessagePack over WebSocket
- **API**: Native fetch with typed wrappers

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - See [LICENSE](LICENSE)
