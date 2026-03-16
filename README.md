# nqita-cli

Command-line tools for the nqita AI runtime.

## Installation

```bash
# Install globally
npm install -g nqita-cli

# Or use with npx
npx nqita-cli <command>
```

## Commands

| Command | Description |
|---------|-------------|
| `nqita init` | Initialize nqita in your project |
| `nqita chat` | Start interactive chat session |
| `nqita generate` | Generate code with AI |
| `nqita analyze` | Analyze codebase with AI |
| `nqita config` | Manage configuration |

## Configuration

Create `nqita.json` in your project:

```json
{
  "runtime": "https://nikita.wokspec.org",
  "model": "claude-3.5-sonnet",
  "temperature": 0.7
}
```

## Environment Variables

```bash
NQITA_API_KEY    # Your API key
NQITA_RUNTIME    # Custom runtime URL (optional)
```

## Documentation

- [nqita](https://github.com/nqita/nqita) — Main runtime
- [nikita.wokspec.org](https://nikita.wokspec.org) — Live demo

---

MIT License
