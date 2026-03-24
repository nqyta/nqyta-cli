# Nqita Local API

Nqita is pronounced `Nick-ee-tah`.

The local daemon is the canonical runtime for the CLI, sprite surfaces, and future desktop integrations.

## Transport

Current transport:

- Unix socket on Linux/macOS
- named pipe on Windows

Planned optional transport:

- `http://127.0.0.1:<port>` for local desktop integrations

## Request model

Current requests are line-delimited JSON over the local socket.

Minimal request:

```json
{
  "id": "req_123",
  "type": "chat",
  "intent": "explain",
  "message": "why did this script fail?"
}
```

Supported intents:

- `chat`
- `think`
- `explain`
- `run`

## Response model

```json
{
  "id": "req_123",
  "ok": true,
  "intent": "explain",
  "message": "The failure is caused by ...",
  "state": {
    "mode": "speaking",
    "x": 84,
    "bubble": "Reply ready.",
    "updatedAt": "2026-03-23T12:00:00.000Z"
  }
}
```

## Planned localhost API

### `GET /v1/health`

Returns daemon health and active provider metadata.

### `POST /v1/tasks`

Creates a new task request.

```json
{
  "intent": "run",
  "message": "run the tests and explain the failures"
}
```

### `GET /v1/tasks/:id`

Returns task status, current sprite state, and summary text.

### `GET /v1/config`

Returns a sanitized config view without secrets.

## Security rules

- local-only transport by default
- no remote logging required
- context reads must be permission-gated
- OS actions must be structured, validated, and auditable
