import fs from "node:fs";
import { spawn } from "node:child_process";
import { sendDaemonRequest } from "./socket.js";
import { getPidPath, getSocketPath } from "./paths.js";

export async function ensureDaemon(entryFile: string): Promise<void> {
  try {
    const response = await sendDaemonRequest({ type: "ping" });
    if (response.ok) {
      return;
    }
  } catch {
    spawnDetachedDaemon(entryFile);
    await waitForSocket();
  }
}

function spawnDetachedDaemon(entryFile: string): void {
  const child = spawn(process.execPath, [entryFile, "daemon", "start", "--foreground"], {
    detached: true,
    stdio: "ignore",
    env: process.env
  });

  child.unref();
}

async function waitForSocket(): Promise<void> {
  const socketPath = getSocketPath();

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (fs.existsSync(socketPath) || process.platform === "win32") {
      try {
        const response = await sendDaemonRequest({ type: "ping" });
        if (response.ok) {
          return;
        }
      } catch {
        // keep waiting
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error("Timed out waiting for the local daemon to start.");
}

export function stopDaemonByPid(): boolean {
  try {
    const pid = Number(fs.readFileSync(getPidPath(), "utf8").trim());
    process.kill(pid, "SIGTERM");
    return true;
  } catch {
    return false;
  }
}
