# Codex External CLI

一个轻量的 Codex extension，用于把用户自行安装的 pi、Google Antigravity (`agy`)、Claude Code (`claude`)、Codex (`codex`) 或任意兼容 CLI 配置成 Codex 可调用的 sub agent。

## 安装

要求 Node.js 20+。在本仓库执行：

```bash
npm install
npm link                 # 必需：让 Codex skill 能在 PATH 中找到 runner
codex plugin marketplace add .
codex plugin add external-cli@codex-external-cli
```

## 配置与调用

扩展不会自动下载或安装外部 CLI。用户需要先自行安装并确保命令在 PATH 中。默认 provider 使用 `pi -p {prompt}`、`agy --prompt {prompt}`、`claude -p {prompt}` 和 `codex -p {prompt}`。可通过配置覆盖命令和参数：

```bash
codex-external configure claude --command claude --args '["-p","{prompt}"]'
codex-external configure agy --command agy --args '["--prompt","{prompt}"]'
codex-external configure codex --command codex --args '["-p","{prompt}"]'
codex-external configure pi --command pi --args '["-p","{prompt}"]'
codex-external doctor --json
codex-external run claude "审查当前改动，列出高风险问题" --json
```

`{prompt}` 会被安全地替换为提示词；没有占位符时提示词会作为最后一个参数追加。进程使用 `shell: false` 启动，支持 `--cwd`、`--timeout` 和 `--env=KEY=VALUE`。配置文件默认位于 `~/.config/codex-external-cli/config.json`，可用 `CODEX_EXTERNAL_CLI_CONFIG` 覆盖。

外部 CLI 的输出只作为建议，Codex 仍负责判断、修改、测试和提交。

本项目的设计参考了 [External Models for Codex](https://github.com/yilibinbin/external-models-for-codex)：采用 Codex marketplace/plugin manifest，并通过 skill 将自然语言请求路由到本地 CLI。
