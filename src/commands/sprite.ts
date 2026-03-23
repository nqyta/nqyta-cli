import fs from "node:fs";
import { getSpriteStatePath } from "../lib/paths.js";
import type { SpriteState } from "../lib/types.js";

const frames: Record<string, string[]> = {
  idle: [
    "  /\\_/\\\\ ",
    " ( o.o )",
    " /  ^  \\\\",
    " \\_|||_/"
  ],
  reaction: [
    "  /\\_/\\\\ ",
    " ( O.O )",
    " /  !  \\\\",
    " \\_|||_/"
  ],
  thinking: [
    "  /\\_/\\\\ ",
    " ( -.- )",
    " /  ?  \\\\",
    " \\_|||_/"
  ],
  researching: [
    "  /\\_/\\\\ ",
    " ( ^.^ )",
    " / [_] \\\\",
    " \\_|||_/"
  ],
  speaking: [
    "  /\\_/\\\\ ",
    " ( ^o^ )",
    " /  ~  \\\\",
    " \\_|||_/"
  ],
  success: [
    "  /\\_/\\\\ ",
    " ( ^.^ )",
    " /  *  \\\\",
    " \\_|||_/"
  ],
  error: [
    "  /\\_/\\\\ ",
    " ( x.x )",
    " /  !  \\\\",
    " \\_|||_/"
  ]
};

export async function runSpriteCommand(args: string[]): Promise<void> {
  const [subcommand] = args;

  if (subcommand === "watch") {
    process.stdout.write("Watching sprite state. Press Ctrl+C to stop.\n");
    let previous = "";

    while (true) {
      const snapshot = renderState(readState());
      if (snapshot !== previous) {
        process.stdout.write("\u001bc");
        process.stdout.write(snapshot);
        previous = snapshot;
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  process.stdout.write(["Usage:", "  nqita sprite watch"].join("\n") + "\n");
}

function readState(): SpriteState {
  try {
    return JSON.parse(fs.readFileSync(getSpriteStatePath(), "utf8")) as SpriteState;
  } catch {
    return {
      mode: "idle",
      x: 0,
      bubble: "Waiting for the daemon.",
      updatedAt: new Date().toISOString()
    };
  }
}

function renderState(state: SpriteState): string {
  const frame = frames[state.mode] ?? frames.idle;
  const pad = " ".repeat(Math.max(0, state.x * 2));
  const bubble = `${pad}[${state.mode}] ${state.bubble}`;
  const art = frame.map((line) => pad + line).join("\n");
  return `${bubble}\n\n${art}\n\nupdated: ${state.updatedAt}\n`;
}
