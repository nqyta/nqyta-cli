#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { runChatCommand } from "./commands/chat.js";
import { runConfigCommand } from "./commands/config.js";
import { runDaemonCommand } from "./commands/daemon.js";
import { runSpriteCommand } from "./commands/sprite.js";

const entryFile = fileURLToPath(import.meta.url);

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  if (command === "chat") {
    await runChatCommand(args, entryFile);
    return;
  }

  if (command === "config") {
    runConfigCommand(args);
    return;
  }

  if (command === "daemon") {
    await runDaemonCommand(args, entryFile);
    return;
  }

  if (command === "sprite") {
    await runSpriteCommand(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function printHelp(): void {
  process.stdout.write(
    [
      "nqita-cli prototype",
      "",
      "Commands:",
      "  nqita chat [message]",
      "  nqita daemon start [--foreground]",
      "  nqita daemon status",
      "  nqita daemon stop",
      "  nqita config init",
      "  nqita config get [key]",
      "  nqita config set <key> <value>",
      "  nqita config path",
      "  nqita sprite watch"
    ].join("\n") + "\n"
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`nqita: ${message}\n`);
  process.exit(1);
});
