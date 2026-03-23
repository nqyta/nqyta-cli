# nqita-cli

`nqita-cli` is the first runnable prototype of talking to Nqita from a terminal while a local sprite watcher renders her state transitions.

This release is a **prototype**, not the final desktop overlay. It gives you:

- a local daemon process
- a terminal chat client
- Groq as the native default provider
- BYOK-oriented provider config
- a pixel-ish sprite watcher that follows daemon state changes

## What works right now

### Local daemon

The daemon runs on a local socket and owns:

- provider selection
- chat requests
- sprite-state emission
- local config

### Chat flow

`nqita chat` will:

1. start the daemon if it is not already running
2. send your message to the daemon
3. call Groq if `GROQ_API_KEY` is present
4. fall back to prototype mode if no Groq key is available
5. emit sprite transitions for `reaction`, `thinking`, `speaking`, and `idle`

### Sprite watcher

`nqita sprite watch` renders a simple terminal sprite view driven by daemon state files. It is a stand-in for the later OS-level overlay.

## Quickstart

```bash
npm install
npm run build

node dist/bin.js config init
node dist/bin.js daemon start
node dist/bin.js sprite watch
```

In another terminal:

```bash
node dist/bin.js chat "summarize what you are doing"
```

## Groq default

Nqita is wired to prefer **Groq** by default.

Set:

```bash
export GROQ_API_KEY=your_key_here
```

Without a Groq key, the prototype still works in fallback mode so the daemon and sprite loop remain demoable.

## BYOK direction

The config model is already structured around provider switching. The first prototype exposes:

```bash
node dist/bin.js config get
node dist/bin.js config set provider groq
node dist/bin.js config set model llama-3.3-70b-versatile
```

Current config file:

```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "sprite": {
    "enabled": true,
    "bubbleMode": true
  }
}
```

## Commands

```bash
nqita chat [message]
nqita daemon start [--foreground]
nqita daemon status
nqita daemon stop
nqita config init
nqita config get [key]
nqita config set <key> <value>
nqita config path
nqita sprite watch
```

## Prototype boundaries

This release does **not** yet provide:

- a native OS overlay window
- actual pointer/window navigation across the desktop
- real provider adapters beyond Groq
- tool execution against the operating system

It does provide the daemon and event model those features need.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the intended split between CLI, daemon, provider routing, sprite bridge, and future desktop overlay.

## Repositories

- Main runtime and platform: `https://github.com/ws-nqita/nqita`
- CLI companion: `https://github.com/ws-nqita/nqita-cli`

MIT License
