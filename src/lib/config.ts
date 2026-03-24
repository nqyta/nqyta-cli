import { readJsonFile, readTextFile, writeTextFile } from "./fs.js";
import { getConfigPath, getLegacyConfigPath } from "./paths.js";
import type { NqitaConfig, PersonalityMode, PrivacyMode, ProviderName } from "./types.js";

const defaultConfig: NqitaConfig = {
  name: "Nqita",
  pronunciation: "Nick-ee-tah",
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  privacy: {
    mode: "strict-local",
    logPrompts: false,
    allowWindowContext: false,
    allowTerminalContext: true,
    encryptLocalMemory: true
  },
  personality: {
    mode: "default",
    tone: "concise, grounded, technically useful"
  },
  tools: {
    terminal: true,
    browser: false,
    vscode: false
  },
  plugins: {
    web3: false
  },
  sprite: {
    enabled: true,
    bubbleMode: true
  }
};

export function getDefaultConfig(): NqitaConfig {
  return structuredClone(defaultConfig);
}

export function loadConfig(): NqitaConfig {
  const yaml = readTextFile(getConfigPath());
  const config = yaml
    ? parseSimpleYaml(yaml)
    : readJsonFile<Partial<NqitaConfig>>(getLegacyConfigPath());

  if (!config) {
    return getDefaultConfig();
  }

  return {
    name: config.name ?? defaultConfig.name,
    pronunciation: config.pronunciation ?? defaultConfig.pronunciation,
    provider: (config.provider ?? defaultConfig.provider) as ProviderName,
    model: config.model ?? defaultConfig.model,
    privacy: {
      mode: (config.privacy?.mode ?? defaultConfig.privacy.mode) as PrivacyMode,
      logPrompts: config.privacy?.logPrompts ?? defaultConfig.privacy.logPrompts,
      allowWindowContext:
        config.privacy?.allowWindowContext ?? defaultConfig.privacy.allowWindowContext,
      allowTerminalContext:
        config.privacy?.allowTerminalContext ?? defaultConfig.privacy.allowTerminalContext,
      encryptLocalMemory:
        config.privacy?.encryptLocalMemory ?? defaultConfig.privacy.encryptLocalMemory
    },
    personality: {
      mode: (config.personality?.mode ?? defaultConfig.personality.mode) as PersonalityMode,
      tone: config.personality?.tone ?? defaultConfig.personality.tone
    },
    tools: {
      terminal: config.tools?.terminal ?? defaultConfig.tools.terminal,
      browser: config.tools?.browser ?? defaultConfig.tools.browser,
      vscode: config.tools?.vscode ?? defaultConfig.tools.vscode
    },
    plugins: {
      web3: config.plugins?.web3 ?? defaultConfig.plugins.web3
    },
    sprite: {
      enabled: config.sprite?.enabled ?? defaultConfig.sprite.enabled,
      bubbleMode: config.sprite?.bubbleMode ?? defaultConfig.sprite.bubbleMode
    }
  };
}

export function saveConfig(config: NqitaConfig): void {
  writeTextFile(getConfigPath(), stringifySimpleYaml(config));
}

export function setConfigValue(key: string, rawValue: string): NqitaConfig {
  const config = loadConfig();

  const parsedValue = parseRawValue(rawValue);
  const segments = key.split(".");
  let target: Record<string, unknown> = config as unknown as Record<string, unknown>;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const next = target[segment];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      throw new Error(`Unknown config key: ${key}`);
    }
    target = next as Record<string, unknown>;
  }

  const finalKey = segments.at(-1);
  if (!finalKey || !(finalKey in target)) {
    throw new Error(`Unknown config key: ${key}`);
  }

  target[finalKey] = parsedValue;
  saveConfig(config);
  return config;
}

export function getConfigValue(key: string): string {
  const config = loadConfig() as unknown as Record<string, unknown>;
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, config);

  if (value === undefined) {
    throw new Error(`Unknown config key: ${key}`);
  }

  return typeof value === "string" ? value : JSON.stringify(value);
}

function parseRawValue(rawValue: string): boolean | string {
  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  return rawValue;
}

function parseSimpleYaml(input: string): Partial<NqitaConfig> | null {
  const result: Record<string, unknown> = {};
  const stack: Array<{ indent: number; value: Record<string, unknown> }> = [
    { indent: -1, value: result }
  ];

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, "  ");
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = /^(\s*)([A-Za-z0-9_.-]+):(?:\s+(.*))?$/.exec(line);
    if (!match) {
      continue;
    }

    const indent = match[1].length;
    const key = match[2];
    const rawValue = match[3];

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].value;
    if (rawValue === undefined || rawValue === "") {
      const next: Record<string, unknown> = {};
      parent[key] = next;
      stack.push({ indent, value: next });
      continue;
    }

    parent[key] = parseYamlScalar(rawValue);
  }

  return result as Partial<NqitaConfig>;
}

function parseYamlScalar(rawValue: string): boolean | string {
  const value = rawValue.trim();
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function stringifySimpleYaml(config: NqitaConfig): string {
  return [
    "# Nqita config",
    "# Pronounced: Nick-ee-tah",
    "",
    `name: ${quote(config.name)}`,
    `pronunciation: ${quote(config.pronunciation)}`,
    `provider: ${config.provider}`,
    `model: ${quote(config.model)}`,
    "privacy:",
    `  mode: ${config.privacy.mode}`,
    `  logPrompts: ${String(config.privacy.logPrompts)}`,
    `  allowWindowContext: ${String(config.privacy.allowWindowContext)}`,
    `  allowTerminalContext: ${String(config.privacy.allowTerminalContext)}`,
    `  encryptLocalMemory: ${String(config.privacy.encryptLocalMemory)}`,
    "personality:",
    `  mode: ${config.personality.mode}`,
    `  tone: ${quote(config.personality.tone)}`,
    "tools:",
    `  terminal: ${String(config.tools.terminal)}`,
    `  browser: ${String(config.tools.browser)}`,
    `  vscode: ${String(config.tools.vscode)}`,
    "plugins:",
    `  web3: ${String(config.plugins.web3)}`,
    "sprite:",
    `  enabled: ${String(config.sprite.enabled)}`,
    `  bubbleMode: ${String(config.sprite.bubbleMode)}`,
    ""
  ].join("\n");
}

function quote(value: string): string {
  return JSON.stringify(value);
}
