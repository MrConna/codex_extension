#!/usr/bin/env node
import { loadConfig, saveConfig, configPath, DEFAULT_PROVIDERS } from "../src/config.mjs";
import { runProvider } from "../src/runner.mjs";

const args = process.argv.slice(2);
const command = args.shift() || "help";
const flag = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1] ?? fallback; };
const has = (name) => args.includes(name);
const output = (value) => process.stdout.write(`${has("--json") ? JSON.stringify(value) : typeof value === "string" ? value : JSON.stringify(value, null, 2)}\n`);

try {
  const config = await loadConfig();
  if (command === "help") { output("codex-external configure|list|doctor|run"); process.exit(0); }
  if (command === "list") { output(Object.entries({ ...DEFAULT_PROVIDERS, ...(config.providers || {}) }).map(([name, p]) => ({ name, command: p.command, args: p.args, configured: Boolean(config.providers?.[name]) }))); process.exit(0); }
  if (command === "configure") {
    const name = args.shift(); if (!name) throw new Error("Usage: configure <name> --command <executable> [--args <json-array>]");
    const commandPath = flag("--command", name); const rawArgs = flag("--args", "[\"{prompt}\"]");
    let providerArgs; try { providerArgs = JSON.parse(rawArgs); } catch { throw new Error("--args must be a JSON array, e.g. '[\"-p\",\"{prompt}\"]'"); }
    if (!Array.isArray(providerArgs) || providerArgs.some((x) => typeof x !== "string")) throw new Error("--args must be a JSON array of strings");
    config.providers ||= {}; config.providers[name] = { command: commandPath, args: providerArgs, ...(flag("--timeout", null) ? { timeout: Number(flag("--timeout", 0)) } : {}) };
    await saveConfig(config); output({ ok: true, provider: name, config: configPath() }); process.exit(0);
  }
  if (command === "doctor") {
    const names = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--json") continue;
      if (args[i] === "--timeout") { i += 1; continue; }
      if (args[i].startsWith("--")) continue;
      names.push(args[i]);
    }
    if (!names.length) names.push(...Object.keys({ ...DEFAULT_PROVIDERS, ...(config.providers || {}) }));
    const checks = await Promise.all(names.map(async (name) => { const p = config.providers?.[name] || DEFAULT_PROVIDERS[name]; if (!p) return { name, ok: false, error: "not configured" }; const result = await runProvider({ providers: { [name]: p } }, name, "Reply with exactly: OK", { timeout: Number(flag("--timeout", 5000)) }); return { name, command: p.command, ok: result.ok, error: result.error || result.stderr || undefined }; }));
    output({ config: configPath(), checks }); process.exit(checks.some((x) => !x.ok) ? 1 : 0);
  }
  if (command === "run") {
    const name = args.shift(); if (!name) throw new Error("Usage: run <provider> <prompt>");
    const promptParts = [];
    for (let i = 0; i < args.length; i += 1) {
      const item = args[i];
      if (item === "--json") continue;
      if (item === "--cwd" || item === "--timeout") { i += 1; continue; }
      if (item.startsWith("--env=")) continue;
      promptParts.push(item);
    }
    const prompt = promptParts.join(" ").trim() || (await new Promise((resolve) => { let s = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", (d) => { s += d; }); process.stdin.on("end", () => resolve(s.trim())); }));
    if (!prompt) throw new Error("A prompt is required (argument or stdin).");
    const env = Object.fromEntries(args.filter((x) => x.startsWith("--env=")).map((x) => x.slice(6).split(/=(.*)/s, 2)));
    const result = await runProvider(config, name, prompt, { cwd: flag("--cwd", process.cwd()), timeout: flag("--timeout", 0), env });
    output(result); process.exit(result.ok ? 0 : 1);
  }
  throw new Error(`Unknown command "${command}"`);
} catch (error) { process.stderr.write(`${error.message}\n`); process.exit(2); }
