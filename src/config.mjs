import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

export const DEFAULT_PROVIDERS = {
  pi: { command: "pi", args: ["-p", "{prompt}"], description: "Pi coding agent" },
  agy: { command: "agy", args: ["--prompt", "{prompt}"], description: "Google Antigravity CLI" },
  claude: { command: "claude", args: ["-p", "{prompt}"], description: "Claude Code CLI" }
};

export function configPath(env = process.env) {
  return env.CODEX_EXTERNAL_CLI_CONFIG || path.join(env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "codex-external-cli", "config.json");
}

export async function loadConfig(file = configPath()) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return { providers: {} }; throw new Error(`Invalid config ${file}: ${error.message}`); }
}

export async function saveConfig(config, file = configPath()) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}

export function providerConfig(config, name) {
  const item = { ...DEFAULT_PROVIDERS, ...(config.providers || {}) }[name];
  if (!item) throw new Error(`Unknown provider "${name}". Run "codex-external list" or configure it first.`);
  if (!item.command || !Array.isArray(item.args)) throw new Error(`Provider "${name}" must define command and args.`);
  return item;
}
