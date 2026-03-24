import os from "node:os";
import path from "node:path";

const baseDir = path.join(os.homedir(), ".config", "nqita-cli");

export function getBaseDir(): string {
  return baseDir;
}

export function getConfigPath(): string {
  return path.join(baseDir, "nqita.yaml");
}

export function getLegacyConfigPath(): string {
  return path.join(baseDir, "config.json");
}

export function getSpriteStatePath(): string {
  return path.join(baseDir, "sprite-state.json");
}

export function getSpriteLogPath(): string {
  return path.join(baseDir, "sprite-events.log");
}

export function getPidPath(): string {
  return path.join(baseDir, "daemon.pid");
}

export function getSocketPath(): string {
  if (process.platform === "win32") {
    return "\\\\.\\pipe\\nqita-cli-daemon";
  }

  return path.join(baseDir, "daemon.sock");
}
