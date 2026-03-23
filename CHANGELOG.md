# Changelog

## 0.1.0

Initial prototype release of `nqita-cli`.

- added a TypeScript CLI package with a buildable `nqita` binary
- added a local daemon process using a Unix socket / named pipe transport
- added `chat`, `daemon`, `config`, and `sprite` commands
- added Groq-first provider routing with prototype fallback mode
- added a terminal sprite watcher driven by daemon-emitted sprite state
- added prototype docs describing the intended CLI + daemon + sprite architecture
