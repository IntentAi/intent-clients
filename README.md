# Intent Clients

Official clients for [Intent](https://github.com/IntentAi/intent) — open-source, privacy-first chat platform.

## Setup

```bash
cd web
npm install
cp .env.example .env    # configure your Intent server URLs
npm run dev             # localhost:5173
```

Requires Node.js 18+ and a running Intent server.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
```

## Architecture

```
web/src/
  api/          REST client layer
  gateway/      WebSocket (MessagePack binary protocol)
  stores/       Zustand state management
  components/   React components
  pages/        Route pages
  types/        TypeScript definitions
```

## Stack

- React 19 + TypeScript + Vite
- Zustand for state
- Tailwind CSS
- React Router v7
- MessagePack over WebSocket

## Clients

| Client | Status |
|--------|--------|
| Web | Active development |
| Desktop (Tauri) | Planned |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
