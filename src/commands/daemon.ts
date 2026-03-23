import { spawn } from "node:child_process";
import { startDaemonServer } from "../daemon/server.js";
import { sendDaemonRequest } from "../lib/socket.js";
import { stopDaemonByPid } from "../lib/daemon-client.js";

export async function runDaemonCommand(args: string[], entryFile: string): Promise<void> {
  const [subcommand, flag] = args;

  if (subcommand === "start") {
    if (flag === "--foreground") {
      await startDaemonServer();
      return;
    }

    const child = spawn(process.execPath, [entryFile, "daemon", "start", "--foreground"], {
      detached: true,
      stdio: "ignore",
      env: process.env
    });
    child.unref();
    process.stdout.write("Started nqita daemon in the background.\n");
    return;
  }

  if (subcommand === "status") {
    try {
      const response = await sendDaemonRequest({ type: "ping" });
      process.stdout.write(JSON.stringify(response, null, 2) + "\n");
    } catch {
      process.stdout.write("Daemon is not running.\n");
      process.exitCode = 1;
    }
    return;
  }

  if (subcommand === "stop") {
    process.stdout.write(stopDaemonByPid() ? "Sent SIGTERM to daemon.\n" : "No daemon pid found.\n");
    return;
  }

  process.stdout.write(
    ["Usage:", "  nqita daemon start [--foreground]", "  nqita daemon status", "  nqita daemon stop"].join(
      "\n"
    ) + "\n"
  );
}
