import { loadConfig, saveConfig, setConfigValue } from "../lib/config.js";
import { getConfigPath } from "../lib/paths.js";

export function runConfigCommand(args: string[]): void {
  const [subcommand, key, value] = args;

  if (subcommand === "path") {
    process.stdout.write(getConfigPath() + "\n");
    return;
  }

  if (subcommand === "init") {
    const config = loadConfig();
    saveConfig(config);
    process.stdout.write(`Initialized config at ${getConfigPath()}\n`);
    return;
  }

  if (subcommand === "get") {
    const config = loadConfig();
    if (!key) {
      process.stdout.write(JSON.stringify(config, null, 2) + "\n");
      return;
    }

    const lookup = key === "provider"
      ? config.provider
      : key === "model"
        ? config.model
        : key === "sprite.enabled"
          ? String(config.sprite.enabled)
          : key === "sprite.bubbleMode"
            ? String(config.sprite.bubbleMode)
            : undefined;

    if (lookup === undefined) {
      throw new Error(`Unknown config key: ${key}`);
    }

    process.stdout.write(String(lookup) + "\n");
    return;
  }

  if (subcommand === "set") {
    if (!key || value === undefined) {
      throw new Error("Usage: nqita config set <key> <value>");
    }

    const config = setConfigValue(key, value);
    process.stdout.write(JSON.stringify(config, null, 2) + "\n");
    return;
  }

  process.stdout.write(
    [
      "Usage:",
      "  nqita config init",
      "  nqita config path",
      "  nqita config get [key]",
      "  nqita config set <key> <value>"
    ].join("\n") + "\n"
  );
}
