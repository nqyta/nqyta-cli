import { readJsonFile, writeJsonFile } from "./fs.js";
import { getConfigPath } from "./paths.js";
import type { NqitaConfig, ProviderName } from "./types.js";

const defaultConfig: NqitaConfig = {
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  sprite: {
    enabled: true,
    bubbleMode: true
  }
};

export function getDefaultConfig(): NqitaConfig {
  return structuredClone(defaultConfig);
}

export function loadConfig(): NqitaConfig {
  const config = readJsonFile<Partial<NqitaConfig>>(getConfigPath());
  if (!config) {
    return getDefaultConfig();
  }

  return {
    provider: (config.provider ?? defaultConfig.provider) as ProviderName,
    model: config.model ?? defaultConfig.model,
    sprite: {
      enabled: config.sprite?.enabled ?? defaultConfig.sprite.enabled,
      bubbleMode: config.sprite?.bubbleMode ?? defaultConfig.sprite.bubbleMode
    }
  };
}

export function saveConfig(config: NqitaConfig): void {
  writeJsonFile(getConfigPath(), config);
}

export function setConfigValue(key: string, rawValue: string): NqitaConfig {
  const config = loadConfig();

  if (key === "provider") {
    config.provider = rawValue as ProviderName;
  } else if (key === "model") {
    config.model = rawValue;
  } else if (key === "sprite.enabled") {
    config.sprite.enabled = rawValue === "true";
  } else if (key === "sprite.bubbleMode") {
    config.sprite.bubbleMode = rawValue === "true";
  } else {
    throw new Error(`Unknown config key: ${key}`);
  }

  saveConfig(config);
  return config;
}
