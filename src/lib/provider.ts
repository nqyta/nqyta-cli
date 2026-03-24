import type { NqitaConfig, NqitaIntent } from "./types.js";

export async function generateReply(
  message: string,
  config: NqitaConfig,
  intent: NqitaIntent
): Promise<string> {
  if (config.provider === "groq") {
    const key = process.env.GROQ_API_KEY;
    if (key) {
      try {
        return await chatWithGroq(message, config, key, intent);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "unknown provider failure";
        return mockReply(message, config, intent, `Groq failed, falling back to prototype mode: ${detail}`);
      }
    }

    return mockReply(message, config, intent, "No GROQ_API_KEY found, running prototype mode.");
  }

  return mockReply(
    message,
    config,
    intent,
    `Provider ${config.provider} is not wired yet, using prototype mode.`
  );
}

async function chatWithGroq(
  message: string,
  config: NqitaConfig,
  apiKey: string,
  intent: NqitaIntent
): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(config, intent)
        },
        {
          role: "user",
          content: message
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Groq HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response");
  }

  return text;
}

function buildSystemPrompt(config: NqitaConfig, intent: NqitaIntent): string {
  return [
    `You are ${config.name}, pronounced ${config.pronunciation}.`,
    "You are a local-first OS-level AI companion that starts in the terminal and grows into a native desktop/runtime layer.",
    "Be concise, technically useful, and embodied.",
    `Current intent: ${intent}.`,
    `Privacy mode: ${config.privacy.mode}.`,
    `Allowed tools: terminal=${String(config.tools.terminal)}, browser=${String(config.tools.browser)}, vscode=${String(config.tools.vscode)}.`,
    "Never imply remote logging is required. Prefer local-first recommendations."
  ].join(" ");
}

function mockReply(message: string, config: NqitaConfig, intent: NqitaIntent, reason: string): string {
  return [
    reason,
    "",
    `${config.name} (${config.pronunciation}) heard: "${message}"`,
    "",
    `Intent lane: ${intent}.`,
    `Privacy mode: ${config.privacy.mode}.`,
    "Visual state sequence: reaction -> thinking/researching -> speaking -> idle.",
    "Next implementation step is wiring structured local tools, permissions, and a real desktop overlay."
  ].join("\n");
}
