import test from "node:test";
import assert from "node:assert/strict";
import { interpolateArgs } from "../src/runner.mjs";
import { DEFAULT_PROVIDERS } from "../src/config.mjs";

test("interpolates prompt without shell parsing", () => {
  assert.deepEqual(interpolateArgs(["-p", "{prompt}"], "$(touch hacked)"), ["-p", "$(touch hacked)"]);
});
test("appends prompt when template has no placeholder", () => {
  assert.deepEqual(interpolateArgs(["--json"], "hello"), ["--json", "hello"]);
});
test("uses user-installed CLI names for built-in providers", () => {
  assert.equal(DEFAULT_PROVIDERS.claude.command, "claude");
  assert.equal(DEFAULT_PROVIDERS.codex.command, "codex");
  assert.equal(DEFAULT_PROVIDERS.agy.command, "agy");
});
