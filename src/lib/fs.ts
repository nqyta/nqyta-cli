import fs from "node:fs";
import { getBaseDir } from "./paths.js";

export function ensureBaseDir(): void {
  fs.mkdirSync(getBaseDir(), { recursive: true });
}

export function writeJsonFile(filePath: string, value: unknown): void {
  ensureBaseDir();
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export function readJsonFile<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}
