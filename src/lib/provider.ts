import type { NqitaConfig } from "./types.js";

export async function generateReply(message: string, config: NqitaConfig): Promise<string> {
  if (config.provider === "groq") {
    const key = process.env.GROQ_API_KEY;
    if (key) {
      try {
        return await chatWithGroq(message, config.model, key);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "unknown provider failure";
        return mockReply(message, `Groq failed, falling back to prototype mode: ${detail}`);
      }
    }

    return mockReply(message, "No GROQ_API_KEY found, running prototype mode.");
  }

  return mockReply(message, `Provider ${config.provider} is not wired yet, using prototype mode.`);
}

async function chatWithGroq(message: string, model: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are Nqita, a pink pixel desktop companion. Be concise, technically useful, and a little embodied."
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

function mockReply(message: string, reason: string): string {
  return [
    reason,
    "",
    `Prototype Nqita heard: "${message}"`,
    "",
    "Visual state sequence: reaction -> thinking -> speaking -> idle.",
    "Next implementation step is wiring the sprite bridge to a real desktop overlay."
  ].join("\n");
}
