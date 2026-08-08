import { spawn } from "node:child_process";
import { providerConfig } from "./config.mjs";

export function interpolateArgs(args, prompt) {
  let used = false;
  const result = args.map((arg) => {
    const value = String(arg).replaceAll("{prompt}", () => { used = true; return prompt; });
    return value;
  });
  if (!used) result.push(prompt);
  return result;
}

export function runProvider(config, name, prompt, options = {}) {
  const provider = providerConfig(config, name);
  const args = interpolateArgs(provider.args, prompt);
  const cwd = options.cwd || process.cwd();
  const env = { ...process.env, ...(provider.env || {}), ...(options.env || {}) };
  const timeout = Number(options.timeout || provider.timeout || 0);
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(provider.command, args, { cwd, env, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "", timedOut = false;
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    const timer = timeout > 0 ? setTimeout(() => { timedOut = true; child.kill("SIGTERM"); }, timeout) : null;
    child.on("error", (error) => { if (timer) clearTimeout(timer); resolve({ ok: false, provider: name, error: error.code === "ENOENT" ? `Command not found: ${provider.command}` : error.message, stdout, stderr, durationMs: Date.now() - started }); });
    child.on("close", (code, signal) => { if (timer) clearTimeout(timer); resolve({ ok: !timedOut && code === 0, provider: name, code, signal, timedOut, stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), durationMs: Date.now() - started }); });
  });
}
