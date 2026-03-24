export type ProviderName = "groq" | "openai" | "anthropic" | "openrouter" | "mock";
export type NqitaIntent = "chat" | "think" | "explain" | "run";
export type PrivacyMode = "strict-local" | "balanced" | "connected";
export type PersonalityMode = "default" | "dev-accelerator" | "research-assistant";

export interface NqitaConfig {
  name: string;
  pronunciation: string;
  provider: ProviderName;
  model: string;
  privacy: {
    mode: PrivacyMode;
    logPrompts: boolean;
    allowWindowContext: boolean;
    allowTerminalContext: boolean;
    encryptLocalMemory: boolean;
  };
  personality: {
    mode: PersonalityMode;
    tone: string;
  };
  tools: {
    terminal: boolean;
    browser: boolean;
    vscode: boolean;
  };
  plugins: {
    web3: boolean;
  };
  sprite: {
    enabled: boolean;
    bubbleMode: boolean;
  };
}

export interface DaemonRequest {
  id: string;
  type: "ping" | "chat";
  message?: string;
  intent?: NqitaIntent;
}

export interface DaemonResponse {
  id: string;
  ok: boolean;
  message?: string;
  intent?: NqitaIntent;
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
