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

## 外部 CLI 安装与认证

本插件不会替用户下载、升级或登录外部 CLI。请先安装你需要的 provider，并确认命令已经在 `PATH` 中。下面是 macOS/Linux 的常用安装方式；Windows 请使用各项目的官方安装器。

| CLI | 安装 | 首次认证/检查 |
| --- | --- | --- |
| Codex | `npm install -g @openai/codex`，或 `brew install --cask codex` | 运行 `codex`，选择 ChatGPT 登录；也可以按官方文档配置 API key |
| Claude Code | `npm install -g @anthropic-ai/claude-code` | 运行 `claude` 完成首次登录；可用 `claude doctor` 检查 |
| Antigravity | `curl -fsSL https://antigravity.google/cli/install.sh \| bash` | 运行 `agy`，按提示完成浏览器/Keychain 登录 |
| Pi | `npm install -g --ignore-scripts @earendil-works/pi-coding-agent` | 运行 `pi` 后执行 `/login`，凭证会保存到 `~/.pi/agent/auth.json` |

官方安装与认证文档： [Codex](https://github.com/openai/codex#quickstart)、[Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)、[Antigravity CLI](https://antigravity.google/docs/cli/install)、[Pi](https://pi.dev/docs/latest/quickstart)。

安装后可以检查命令是否可见：

```bash
command -v codex claude agy pi
codex --version
claude --version
agy --help
pi --version
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

### 模型配置

模型参数也通过 `--args` 固定到 provider。外部 CLI 必须由用户自行安装，并以实际版本支持的模型名为准：

```bash
# Claude Code
codex-external configure claude --command claude --args '["-p","--model","sonnet","{prompt}"]'

# Google Antigravity（可先运行 agy models 查看可用名称）
codex-external configure agy --command agy --args '["--model","Gemini 3.5 Flash (Low)","--prompt","{prompt}"]'

# Codex
codex-external configure codex --command codex --args '["--model","o3","{prompt}"]'

# Pi
codex-external configure pi --command pi --args '["--provider","anthropic","--model","anthropic/claude-sonnet-4-20250514","-p","{prompt}"]'
```

查看 provider 自己报告的模型列表：

```bash
agy models
pi --list-models
pi --list-models deepseek
```

例如使用 Pi 已认证的 DeepSeek V4 Flash：

```bash
codex-external configure pi-deepseek \
  --command pi \
  --args '["--provider","deepseek","--model","deepseek-v4-flash","-p","{prompt}"]'
codex-external run pi-deepseek "写一首关于夜航与星光的诗"
```

需要同时保留多个模型时，可以配置多个 provider 名称，例如 `claude-sonnet`、`claude-opus` 或 `pi-gpt5`。

`{prompt}` 会被安全地替换为提示词；没有占位符时提示词会作为最后一个参数追加。进程使用 `shell: false` 启动，支持 `--cwd`、`--timeout` 和 `--env=KEY=VALUE`。配置文件默认位于 `~/.config/codex-external-cli/config.json`，可用 `CODEX_EXTERNAL_CLI_CONFIG` 覆盖。

外部 CLI 的输出只作为建议，Codex 仍负责判断、修改、测试和提交。

本项目的设计参考了 [External Models for Codex](https://github.com/yilibinbin/external-models-for-codex)：采用 Codex marketplace/plugin manifest，并通过 skill 将自然语言请求路由到本地 CLI。
