# Intent Clients

Official clients for Intent - Desktop, Web, and Mobile.

## Status

 **Phase 1 Development** - Clients are being built.

## Planned Clients

### Desktop (Tauri)
- **Tech**: Rust + Tauri + native webview
- **Target RAM**: <80MB idle
- **Platforms**: Windows, macOS, Linux
- **Status**: Phase 1 (planned)

### Web
- **Tech**: Same frontend as Tauri (code reuse)
- **Deployment**: Self-hostable + hosted at app.intent.chat
- **Status**: Phase 1 (planned)

### Mobile
- **iOS**: Native Swift
- **Android**: Native Kotlin
- **Status**: Phase 2 (after desktop/web)

## Architecture

```
intent-clients/
├── desktop/    # Tauri application
├── web/      # Web client
├── mobile/    # Mobile apps (Phase 2)
└── shared/    # Shared libs (API client, E2EE, types)
```

## Development

In development: Setup instructions for client development.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT License - See [LICENSE](LICENSE)
