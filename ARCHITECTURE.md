# nqita-cli Architecture

## Goal

Let users talk to Nqita from the terminal while her desktop sprite visibly acts as the embodied runtime.

Nqita is pronounced `Nick-ee-tah`.

The key rule is simple:

**text output and sprite behavior must come from the same runtime state machine.**

If the terminal says she is researching, the sprite should already be in a researching state. If a tool call is running, the sprite should look busy. If she is idle, both terminal and overlay should reflect that.

## Product model

The CLI is not the agent itself.

The agent should live in a local daemon process so that:

- chat sessions survive terminal restarts
- the sprite remains active outside one shell session
- memory and tool state live in one place
- multiple clients can attach later

This is what "OS-level companion" means in practice:

- background runtime first, UI surfaces second
- local API over Unix socket, named pipe, or `http://localhost`
- explicit permissions for context reads and tool execution
- privacy-first storage and local memory by default

## Components

### 1. CLI client

Responsibilities:

- parse commands
- send requests to local daemon
- stream response text
- render terminal UX

Examples:

- `nqita chat`
- `nqita config get provider`
- `nqita daemon status`

### 2. Local daemon

Responsibilities:

- maintain session state
- choose provider/model
- execute tools
- emit sprite state transitions
- persist memory and preferences

This is the real brain.

It should eventually run as:

- `systemd --user` on Linux
- `launchd` on macOS
- tray/service runtime on Windows

### 3. Sprite bridge

Responsibilities:

- connect daemon to sprite process
- translate daemon states into animation commands
- manage bubble text and short visual cues

This should be a thin transport layer, not a second brain.

### 4. Sprite overlay

Responsibilities:

- draw animation frames
- move across the desktop
- show bubbles
- react to pointer/focus states

## Runtime flow

```text
User input in terminal
  -> CLI request
  -> daemon session update
  -> provider/tool execution
  -> daemon emits sprite events
  -> sprite overlay updates animation
  -> terminal streams response
```

## Event model

Suggested sprite events:

```json
{
  "type": "sprite.state",
  "state": "thinking",
  "sessionId": "sess_123",
  "message": "looking into that",
  "ts": 1742700000
}
```

Recommended initial state set:

- `idle`
- `reaction`
- `thinking`
- `researching`
- `walking`
- `speaking`
- `success`
- `error`

Suggested terminal-to-daemon request:

```json
{
  "type": "chat.request",
  "sessionId": "sess_123",
  "message": "nqita, check the repo status"
}
```

Suggested intent envelope:

```json
{
  "type": "chat.request",
  "intent": "explain",
  "sessionId": "sess_123",
  "message": "why is this build failing"
}
```

## Provider model

### Default provider

Groq should be the native default.

Reasons:

- low latency is critical for conversational CLI feel
- quick response makes sprite embodiment feel believable
- it reduces the dead-air gap between command and visible reaction

### BYOK routing

The daemon should expose a normalized provider interface:

```ts
interface ProviderAdapter {
  name: string;
  chat(input: ChatInput): Promise<ChatOutput>;
  validateKey(): Promise<boolean>;
}
```

Then map concrete providers behind it:

- Groq
- OpenAI
- Anthropic
- OpenRouter

This avoids provider-specific behavior leaking into CLI commands.

## Key management

Recommendation:

- use env vars for fast local dev
- support a local config file for explicit setup
- prefer OS keychain storage for persisted secrets in later phases

Suggested precedence:

1. command-line override
2. env vars
3. local config file
4. OS keychain-backed saved config

## Config model

The canonical user config should be `nqita.yaml`.

It controls:

- provider and model defaults
- privacy posture
- tool permissions
- personality mode
- optional plugin enablement

Example:

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
tools:
  terminal: true
  browser: false
  vscode: false
plugins:
  web3: false
```

## OS action model

The daemon should not directly couple model output to raw system control.

Use a two-step pattern:

1. model proposes a structured action
2. daemon validates and executes through a typed adapter

Examples:

- read active window title
- open app
- move sprite near focused window
- display bubble
- inspect clipboard

That keeps embodiment safe and debuggable.

## Plugin model

Core runtime stays clean. Optional capabilities come in through plugins.

Suggested interface:

```ts
export interface NqitaPlugin {
  id: string;
  name: string;
  version: string;
  setup(ctx: NqitaPluginContext): Promise<void>;
  getTools?(): Promise<NqitaToolDefinition[]>;
  onEvent?(event: NqitaRuntimeEvent): Promise<void>;
}
```

Initial plugin lanes:

- IDE integrations
- OS-specific helpers
- memory backends
- optional Web3 wallet/RPC integrations

## Optional Web3 layer

Web3 stays disabled by default and never defines Nqita's core identity.

Possible plugin responsibilities:

- explain contracts, signatures, and EIPs in plain language
- read balances and token/NFT state from a local wallet or RPC
- produce opt-in attestations about completed task categories

Suggested attestation shape:

```json
{
  "taskId": "task_123",
  "user": "0xabc...",
  "timestamp": 1742700000,
  "taskType": "research",
  "summaryHash": "0xdef..."
}
```

## MVP recommendation

### Phase 1

- scaffold CLI in TypeScript
- implement `nqita chat`
- implement daemon start/connect
- wire Groq chat
- emit fake sprite events to a local console logger first

### Phase 2

- add real sprite IPC
- add basic desktop overlay integration
- add bubble text and state mapping
- persist session memory locally

### Phase 3

- add BYOK provider switching
- add basic OS actions
- add explicit permission model for sensitive actions
- add plugin host with Web3 disabled by default

## Technical recommendation

Use TypeScript/Node for the CLI and daemon first.

Reason:

- fastest path to shipping
- easiest Groq/OpenAI/Anthropic SDK integration
- matches the existing repo direction
- keeps the command/runtime/provider stack in one language

Later, the sprite shell can still move to Tauri or another platform-specific layer without forcing the CLI to change.

## What not to do

- do not put the full agent runtime inside the CLI process
- do not make BYOK the primary architecture
- do not let the sprite invent its own state independent of the daemon
- do not tie the first release to full autonomous OS control
- do not bake Web3 directly into the core runtime

The first release should feel embodied, not omnipotent.
