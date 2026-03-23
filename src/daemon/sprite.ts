import fs from "node:fs";
import { getSpriteLogPath, getSpriteStatePath } from "../lib/paths.js";
import { ensureBaseDir, writeJsonFile } from "../lib/fs.js";
import type { SpriteEvent, SpriteMode, SpriteState } from "../lib/types.js";

function nextX(): number {
  return Math.floor(Math.random() * 14);
}

export function emitSpriteState(mode: SpriteMode, bubble: string): SpriteState {
  ensureBaseDir();

  const state: SpriteState = {
    mode,
    x: nextX(),
    bubble,
    updatedAt: new Date().toISOString()
  };

  const event: SpriteEvent = {
    ...state,
    source: "daemon"
  };

  writeJsonFile(getSpriteStatePath(), state);
  fs.appendFileSync(getSpriteLogPath(), JSON.stringify(event) + "\n", "utf8");

  return state;
}
