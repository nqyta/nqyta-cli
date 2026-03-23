export type ProviderName = "groq" | "openai" | "anthropic" | "openrouter" | "mock";

export interface NqitaConfig {
  provider: ProviderName;
  model: string;
  sprite: {
    enabled: boolean;
    bubbleMode: boolean;
  };
}

export interface DaemonRequest {
  id: string;
  type: "ping" | "chat";
  message?: string;
}

export interface DaemonResponse {
  id: string;
  ok: boolean;
  message?: string;
  state?: SpriteState;
  error?: string;
}

export type SpriteMode =
  | "idle"
  | "reaction"
  | "thinking"
  | "researching"
  | "speaking"
  | "success"
  | "error";

export interface SpriteState {
  mode: SpriteMode;
  x: number;
  bubble: string;
  updatedAt: string;
}

export interface SpriteEvent extends SpriteState {
  source: "daemon";
}
