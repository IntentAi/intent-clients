# Contributing to Intent Clients

Before you write any code, take a few minutes to read through this.

## Pick an Issue

Check [GitHub Issues](https://github.com/IntentAi/intent-clients/issues). Look at the **blocking relationships** on the right side of each issue — if something is blocked, that dependency needs to land first. Find something open and unblocked, leave a comment to claim it, and wait for assignment.

## Branching

Work is organized into phases, each with its own branch. Check the repo for the current phase branch or ask a maintainer.

- `main` is protected. Never push directly.
- `dev` is the long-term integration branch.
- Your branch comes off the current phase branch: `<phase>/<issue>-description`

```
git checkout <phase-branch> && git pull origin <phase-branch>
git checkout -b <phase-branch>/13-invite-flow
```

No active phase branch? Use `feat/<issue>-description` off `dev`.

## Pull Requests

PR against the **phase branch**, not dev or main. Include what the change does, reference the issue (`Closes #13`), and add screenshots for UI changes.

## Before You Commit

```bash
npm run build     # no type errors
npm run lint      # no warnings
```

Both must pass. Don't push a broken build.

## Commits

Conventional commits, reference the issue, keep them atomic. Explain what changed and why.

```
feat(invites): wire up invite modal to server API [refs #13]

Added invite dialog that calls POST /servers/:id/invites and
copies the generated link. Expiry defaults to 7 days.
```

## Code Standards

- **TypeScript** strict mode, no `any`. All API responses typed.
- **React** functional components with hooks. Keep components focused.
- **Zustand** stores normalized by ID. No business logic in components.
- **Tailwind** only. Dark theme: grays (950/900/800/700), indigo/purple accents. No CSS files.
- Comment the **why**, not the what.

## License

MIT
