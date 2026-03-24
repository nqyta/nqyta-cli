import fs from "node:fs";
import net from "node:net";
import { loadConfig } from "../lib/config.js";
import { ensureBaseDir } from "../lib/fs.js";
import { getPidPath, getSocketPath } from "../lib/paths.js";
import { generateReply } from "../lib/provider.js";
import type { DaemonRequest, DaemonResponse } from "../lib/types.js";
import { emitSpriteState } from "./sprite.js";

export async function startDaemonServer(): Promise<void> {
  ensureBaseDir();
  cleanupSocket();
  fs.writeFileSync(getPidPath(), String(process.pid), "utf8");

  const server = net.createServer((socket) => {
    let buffer = "";

    socket.on("data", async (chunk) => {
      buffer += chunk.toString("utf8");
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex < 0) {
        return;
      }

      const line = buffer.slice(0, newlineIndex);
      const request = JSON.parse(line) as DaemonRequest;
      const response = await handleRequest(request);
      socket.write(JSON.stringify(response) + "\n");
      socket.end();
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(getSocketPath(), resolve);
  });

  const shutdown = () => {
    server.close();
    cleanupSocket();
    try {
      fs.unlinkSync(getPidPath());
    } catch {
      // ignore
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  emitSpriteState("idle", "Nqita woke up.");
}

async function handleRequest(request: DaemonRequest): Promise<DaemonResponse> {
  if (request.type === "ping") {
    return {
      id: request.id,
      ok: true,
      intent: request.intent ?? "chat",
      message: "pong"
    };
  }

  if (request.type === "chat" && request.message) {
    const intent = request.intent ?? "chat";
    emitSpriteState("reaction", intent === "run" ? "Preparing an action." : "I heard you.");
    await pause(120);
    emitSpriteState(intent === "explain" ? "researching" : "thinking", bubbleForIntent(intent));
    await pause(180);

    const config = loadConfig();
    const reply = await generateReply(request.message, config, intent);
    const state = emitSpriteState("speaking", "Reply ready.");
    setTimeout(() => {
      emitSpriteState("idle", "Back at the desktop edge.");
    }, 900);

    return {
      id: request.id,
      ok: true,
      intent,
      message: reply,
      state
    };
  }

  return {
    id: request.id,
    ok: false,
    error: "Unsupported request."
  };
}

function bubbleForIntent(intent: DaemonRequest["intent"]): string {
  if (intent === "think") {
    return "Thinking through options...";
  }

  if (intent === "explain") {
    return "Breaking it down...";
  }

  if (intent === "run") {
    return "Checking the action path...";
  }

  return "Thinking...";
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanupSocket(): void {
  if (process.platform === "win32") {
    return;
  }

  try {
    fs.unlinkSync(getSocketPath());
  } catch {
    // ignore
  }
}
