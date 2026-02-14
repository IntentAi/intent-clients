# Contributing

## Setup

```bash
cd web
npm install
cp .env.example .env  # Configure your Intent server URLs
npm run dev           # Start dev server
```

## Standards

### TypeScript
- Strict mode (no `any` types)
- All API responses must be typed
- Interfaces for data shapes

### React
- Functional components with hooks
- Zustand for state (not Context/Redux)
- Components stay focused and single-purpose

### Styling
- Tailwind CSS only
- Dark theme: grays (950/900/800/700) + indigo/purple
- No custom CSS files

### State
- Normalized stores (keyed by ID)
- Stores handle API responses and gateway events
- No business logic in components

## Workflow

### Branching
- `main` - protected
- `dev` - integration branch
- Feature: `feat/<issue>-description`
- Bug fix: `fix/<issue>-description`

### Commits
```
feat(servers): add creation modal [refs #7]

Built modal with name input and validation.
```

Use conventional commits, reference issues, keep atomic.

### Before Committing
```bash
npm run build     # Must pass
npm run lint      # 0 errors, 0 warnings
```

### Pull Requests
1. Push to feature branch
2. PR against `dev` (not main)
3. Include description
4. Wait for review

## Architecture

- **Zustand** - Lightweight, TypeScript-native state
- **MessagePack** - Smaller payloads than JSON
- **Tailwind** - Co-located styling, no drift
- **Vite** - Fast bundler
- **No Electron** - Tauri uses native webview (<80MB)
- **No SSR** - Static SPA only

## Performance Targets

- Desktop idle: <80MB RAM
- Bundle: Keep minimal, tree-shake aggressively

## License

MIT
