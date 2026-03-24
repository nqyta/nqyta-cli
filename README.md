# nqita-cli

`nqita-cli` is the first runnable prototype of talking to Nqita from a terminal while a local sprite watcher renders her state transitions.

Nqita is pronounced `Nick-ee-tah`. Keep that consistent across the project.

This release is the beginning of Nqita as an OS-level companion, not a website-first chatbot. It gives you:

- a local daemon process
- a terminal chat client
- Groq as the native default provider
- a YAML config for privacy, tools, personality, and plugins
- a pixel-ish sprite watcher that follows daemon state changes

## What works right now

### Local daemon

The daemon runs on a local socket today and is the right place to grow into a background service later. It owns:

- provider selection
- chat requests
- intent-aware task handling
- sprite-state emission
- local config
- privacy boundaries and permission policy

### Chat flow

`nqita chat`, `nqita think`, `nqita explain`, and `nqita run` will:

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
node dist/bin.js think "summarize what you are doing"
```

## Groq default

Nqita is wired to prefer **Groq** by default.

Set:

```bash
export GROQ_API_KEY=your_key_here
```

Without a Groq key, the prototype still works in fallback mode so the daemon and sprite loop remain demoable.

## Config model

Nqita is configured through `nqita.yaml`:

```bash
node dist/bin.js config path
node dist/bin.js config set provider groq
node dist/bin.js config set privacy.mode strict-local
node dist/bin.js config set tools.browser true
```

Current config file:

```yaml
name: "Nqita"
pronunciation: "Nick-ee-tah"
provider: groq
model: "llama-3.3-70b-versatile"
privacy:
  mode: strict-local
  logPrompts: false
  allowWindowContext: false
  allowTerminalContext: true
  encryptLocalMemory: true
personality:
  mode: default
  tone: "concise, grounded, technically useful"
tools:
  terminal: true
  browser: false
  vscode: false
plugins:
  web3: false
sprite:
  enabled: true
  bubbleMode: true
```

Default posture:

- everything stays local unless explicitly configured otherwise
- context access is permissioned, not assumed
- Web3 capabilities stay pluggable and off by default

## Commands

```bash
nqita chat [message]
nqita think [message]
nqita explain [message]
nqita run [message]
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
- gated execution against the operating system
- a full plugin host

It does provide the daemon and event model those features need.

## Contributing

We want open-source help across disciplines, not just terminal tooling.

High-value contribution lanes:

- pixel artists and animators who can help define Nqita's emotional range
- runtime and systems developers for the daemon, socket protocol, memory, and provider routing
- platform engineers for the future desktop overlay bridge
- designers and UX contributors who can help the sprite, bubble, and terminal experiences feel coherent

If you are helping on the broader Nqita project, start with the main repo:

- `https://github.com/ws-nqita/nqita`
- `https://github.com/ws-nqita/nqita/blob/main/CONTRIBUTING.md`

If you want to help specifically on the local runtime and CLI stack, this repo is the right place.

## Local API and plugin direction

- Minimal daemon API: [LOCAL_API.md](./LOCAL_API.md)
- Runtime and plugin design: [ARCHITECTURE.md](./ARCHITECTURE.md)

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the intended split between CLI, daemon, provider routing, sprite bridge, and future desktop overlay.

## Repositories

- Main runtime and platform: `https://github.com/ws-nqita/nqita`
- CLI companion: `https://github.com/ws-nqita/nqita-cli`

MIT License
