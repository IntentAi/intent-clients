# Contributing to Intent Clients

Thanks for contributing to Intent! This guide covers development setup, coding standards, and workflow.

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- A running Intent server (local or remote)

### Web Client Setup

```bash
# Clone and navigate
cd intent-clients/web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Intent server URLs
```

### Running the Dev Server

```bash
npm run dev
```

The app runs at `http://localhost:5173` and connects to your Intent server.

## Project Structure

```
web/src/
├── api/          # REST API client layer
├── gateway/      # WebSocket gateway (MessagePack)
├── stores/       # Zustand state management
├── components/   # React components
│   └── layout/   # App shell (3-panel layout)
├── pages/        # Route-level pages
├── types/        # TypeScript type definitions
└── utils/        # Shared utilities
```

## Coding Standards

### TypeScript
- Strict mode enabled (no `any` types)
- All API responses must be typed
- Use interfaces for data shapes, types for unions/aliases

### React
- Functional components with hooks
- Use Zustand for state (not Context or Redux)
- Keep components focused and single-purpose

### Styling
- Tailwind CSS only (no custom CSS files)
- Dark theme: grays (950/900/800/700) + indigo/purple accents
- Consistent spacing and transitions

### State Management
- Normalized data in stores (keyed by ID)
- Stores handle both API responses and gateway events
- No business logic in components

### Code Quality

```bash
npm run lint      # Must pass with 0 errors, 0 warnings
npm run build     # Must build successfully
```

## Git Workflow

### Branching
- `main` is protected (no direct pushes)
- `dev` is the integration branch
- Feature branches: `feat/<issue>-description`
- Bug fixes: `fix/<issue>-description`

### Before Starting Work
1. Check GitHub issues for the task
2. `git checkout dev && git pull origin dev`
3. `git checkout -b feat/<issue>-description`

### Commits
- Use conventional commits: `feat:`, `fix:`, `refactor:`, etc.
- Reference issue numbers: `[refs #<issue>]`
- Keep commits atomic (one logical change)
- Run tests before committing

Example:
```
feat(servers): add server creation modal [refs #7]

Built modal component for creating servers with name input and validation.

Test: npm run build passed
```

### Pull Requests
1. Push your branch: `git push origin feat/<issue>-description`
2. Open PR against `dev` (not `main`)
3. Include description of changes
4. Wait for review before merging

## Phase 1 Priorities

**Completed:**
- ✅ Gateway client (WebSocket + MessagePack)
- ✅ Authentication (login/register)
- ✅ Zustand stores
- ✅ 3-panel layout

**In Progress:**
- Server API and UI
- Channel API and UI
- Message API and UI
- Gateway event wiring
- End-to-end testing

## Architecture Decisions

### Why Zustand?
Lightweight, TypeScript-native, no boilerplate. Perfect for normalized state.

### Why MessagePack?
Smaller binary payloads and faster parsing than JSON for real-time events.

### Why Tailwind?
Keeps styling co-located with components, prevents style drift, and matches Discord's dark theme easily.

### Why NOT?
- **No Electron**: Too heavy. Tauri uses native webview (<80MB idle).
- **No Next.js/SSR**: This is a SPA, not a website. Static bundle only.
- **No Redux**: Overengineered. Zustand handles everything we need.

## Testing

Before committing:
```bash
npm run build     # TypeScript compilation
npm run lint      # ESLint (must pass with 0 warnings)
```

Include test results in commit messages.

## Performance Targets

- **Desktop idle RAM**: <80MB
- **Voice active RAM**: <150MB
- **Voice latency**: <100ms p95
- **Bundle size**: Keep minimal, tree-shake everything

## Questions?

- Check the [architecture spec](proj%20docs/INTENT_CLIENTS_SPEC.md)
- Open a GitHub issue for clarification
- Review existing PRs for examples

## License

By contributing, you agree to license your contributions under the MIT License.
