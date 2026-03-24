import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ensureDaemon } from "../lib/daemon-client.js";
import { sendDaemonRequest } from "../lib/socket.js";
import type { NqitaIntent } from "../lib/types.js";

export async function runChatCommand(args: string[], entryFile: string): Promise<void> {
  await runIntentCommand("chat", args, entryFile);
}

export async function runIntentCommand(
  intent: NqitaIntent,
  args: string[],
  entryFile: string
): Promise<void> {
  await ensureDaemon(entryFile);

  if (args.length > 0) {
    const response = await sendDaemonRequest({
      type: "chat",
      intent,
      message: args.join(" ")
    });
    printResponse(response.message ?? "", response.intent ?? intent, response.state?.mode);
    return;
  }

  const rl = readline.createInterface({ input, output });
  output.write(`Nqita (${intent}) — pronounced Nick-ee-tah. Type 'exit' to leave.\n\n`);

  while (true) {
    const prompt = await rl.question("you> ");
    if (prompt.trim() === "exit") {
      break;
    }

    if (!prompt.trim()) {
      continue;
    }

    const response = await sendDaemonRequest({
      type: "chat",
      intent,
      message: prompt
    });
    printResponse(response.message ?? "", response.intent ?? intent, response.state?.mode);
  }

  rl.close();
}

function printResponse(message: string, intent: string, mode?: string): void {
  process.stdout.write(`\nnqita/${intent}${mode ? ` [${mode}]` : ""}> ${message}\n\n`);
}
