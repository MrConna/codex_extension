import test from "node:test";
import assert from "node:assert/strict";
import { interpolateArgs } from "../src/runner.mjs";

test("interpolates prompt without shell parsing", () => {
  assert.deepEqual(interpolateArgs(["-p", "{prompt}"], "$(touch hacked)"), ["-p", "$(touch hacked)"]);
});
test("appends prompt when template has no placeholder", () => {
  assert.deepEqual(interpolateArgs(["--json"], "hello"), ["--json", "hello"]);
});
