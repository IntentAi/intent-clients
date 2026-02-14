# Intent Clients

Official clients for Intent - open source chat platform.

## Setup

### Prerequisites
- Node.js 18+
- Running Intent server (local or remote)

### Install

```bash
cd web
npm install
cp .env.example .env
# Edit .env with your server URLs
```

### Development

```bash
npm run dev        # Start dev server at localhost:5173
npm run build      # Build for production
npm run lint       # Run linter
```

## Architecture

```
web/src/
├── api/          # REST API client layer
├── gateway/      # WebSocket (MessagePack protocol)
├── stores/       # Zustand state management
├── components/   # React components
├── pages/        # Route pages
└── types/        # TypeScript definitions
```

## Tech Stack

- React 18 + TypeScript + Vite
- Zustand for state management
- Tailwind CSS for styling
- React Router v6
- MessagePack over WebSocket
- Native fetch API

## Clients

**Web** - React SPA (active development)
**Desktop** - Tauri wrapper (phase 5)
**Mobile** - Native iOS/Android (phase 2+)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
