# Changelog

## v0.2.0

- standardized pronunciation as `Nick-ee-tah`
- documented Nqita as a terminal-first, OS-level local companion
- switched the canonical config format to `nqita.yaml`
- added `think`, `explain`, and `run` CLI intents
- added a minimal local daemon API spec
- documented the plugin model and optional Web3 attestation layer

## 0.1.0

Initial prototype release of `nqita-cli`.

- added a TypeScript CLI package with a buildable `nqita` binary
- added a local daemon process using a Unix socket / named pipe transport
- added `chat`, `daemon`, `config`, and `sprite` commands
- added Groq-first provider routing with prototype fallback mode
- added a terminal sprite watcher driven by daemon-emitted sprite state
- added prototype docs describing the intended CLI + daemon + sprite architecture
