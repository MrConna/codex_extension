---
name: external-cli
description: Invoke a configured local AI CLI as an isolated Codex subagent for a second opinion, planning, or implementation assistance.
---

# External CLI subagent

Use the `codex-external` command installed from this repository (`npm link` at the project root). The marketplace skill calls this PATH command because Codex plugin installation does not install npm package bins. It launches the configured executable with `shell: false`, forwards the prompt as an argument, and returns a structured result.

```bash
codex-external run claude "Review the current changes for correctness and security" --json
codex-external run codex "Propose an implementation plan for this task"
codex-external run agy "Challenge the plan from a second perspective"
codex-external run pi "Inspect the failing tests and suggest a fix" --timeout 120000
```

If a provider is not configured, ask the user to configure it (or provide a command path):

```bash
codex-external configure claude --command claude-official --args '["-p","{prompt}"]'
codex-external configure codex --command codex-official --args '["-p","{prompt}"]'
codex-external configure agy --command agy-official --args '["--prompt","{prompt}"]'
codex-external configure pi --command pi --args '["-p","{prompt}"]'
```

Use `codex-external list` to see built-in defaults and `codex-external doctor --json` to check availability. Treat external output as advisory: Codex remains responsible for edits, tests, commits, and final decisions. Do not pass secrets in prompts.
