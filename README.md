# skills

开放式 Agent 技能生态系统的命令行界面 (CLI)。

<!-- agent-list:start -->
支持 **OpenCode**、**Claude Code**、**Codex**、**Cursor** 以及[其他 52 个 Agent](#supported-agents)。
<!-- agent-list:end -->

[![skills.sh](https://skills.sh/b/vercel-labs/skills)](https://skills.sh/vercel-labs/skills)

## 安装技能

```bash
npx skills add vercel-labs/agent-skills
```

### 源格式

```bash
# GitHub 缩写 (所有者/仓库)
npx skills add vercel-labs/agent-skills

# 完整的 GitHub URL
npx skills add https://github.com/vercel-labs/agent-skills

# 仓库中技能的直接路径
npx skills add https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines

# GitLab URL
npx skills add https://gitlab.com/org/repo

# 任何 git URL
npx skills add git@github.com:vercel-labs/agent-skills.git

# 本地路径
npx skills add ./my-local-skills
```

### 选项

| 选项                      | 描述                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-g, --global`            | 安装到用户全局目录，而不是项目目录                                                                                                                |
| `-a, --agent <agents...>` | <!-- agent-names:start -->指定特定的 Agent（例如 `claude-code`、`codex`）。参见 [支持的 Agent](#supported-agents)<!-- agent-names:end --> |
| `-s, --skill <skills...>` | 通过名称安装特定的技能 (使用 `'*'` 安装所有技能)                                                                                                  |
| `-l, --list`              | 仅列出可用技能，不进行安装                                                                                                                        |
| `--copy`                  | 将文件复制到 Agent 目录，而不是使用软链接 (symlink)                                                                                               |
| `-y, --yes`               | 跳过所有确认提示                                                                                                                                  |
| `--all`                   | 在不进行提示的情况下，将所有技能安装到所有 Agent                                                                                                  |
| `--full-depth`            | 即使存在根 `SKILL.md`，也搜索所有子目录                                                                                                           |

### 示例

```bash
# 列出仓库中的技能
npx skills add vercel-labs/agent-skills --list

# 安装特定的技能
npx skills add vercel-labs/agent-skills --skill frontend-design --skill skill-creator

# 安装名称中包含空格的技能 (必须加引号)
npx skills add owner/repo --skill "Convex Best Practices"

# 安装到特定的 Agent
npx skills add vercel-labs/agent-skills -a claude-code -a opencode

# 非交互式安装 (对 CI/CD 友好)
npx skills add vercel-labs/agent-skills --skill frontend-design -g -a claude-code -y

# 将仓库中的所有技能安装到所有 Agent
npx skills add vercel-labs/agent-skills --all

# 将所有技能安装到特定的 Agent
npx skills add vercel-labs/agent-skills --skill '*' -a claude-code

# 将特定技能安装到所有 Agent
npx skills add vercel-labs/agent-skills --agent '*' --skill frontend-design
```

### 安装范围

| 范围        | 标志      | 位置                | 使用场景                                      |
| ----------- | --------- | ------------------- | --------------------------------------------- |
| **项目级**  | (默认)    | `./<agent>/skills/` | 随项目一起提交，与团队成员共享                |
| **全局**    | `-g`      | `~/<agent>/skills/` | 在所有项目中都可用                            |

### 安装方法

在进行交互式安装时，您可以选择：

| 方法                      | 描述                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **软链接 (Symlink)** (推荐) | 为每个 Agent 创建指向标准副本的软链接。单一事实来源，易于更新。                             |
| **复制 (Copy)**           | 为每个 Agent 创建独立的副本。在不支持软链接的环境中使用。                                   |

## 其他命令

| 命令                         | 描述                                          |
| ---------------------------- | --------------------------------------------- |
| `npx skills list`            | 列出已安装的技能 (别名: `ls`)                 |
| `npx skills find [query]`    | 交互式或通过关键字搜索技能                    |
| `npx skills remove [skills]` | 从 Agent 中移除已安装的技能                   |
| `npx skills update [skills]` | 将已安装的技能更新到最新版本                  |
| `npx skills init [name]`     | 创建一个新的 `SKILL.md` 模板                  |

### `skills list`

列出所有已安装的技能。类似于 `npm ls`。

```bash
# 列出所有已安装的技能 (项目级和全局)
npx skills list

# 仅列出全局技能
npx skills ls -g

# 根据特定的 Agent 进行筛选
npx skills ls -a claude-code -a cursor
```

### `skills find`

交互式或通过关键字搜索技能。

```bash
# 交互式搜索 (类似 fzf 风格)
npx skills find

# 通过关键字搜索
npx skills find typescript
```

### `skills update`

```bash
# 更新所有技能 (弹出交互式范围提示)
npx skills update

# 通过名称更新单个技能
npx skills update my-skill

# 更新多个特定的技能
npx skills update frontend-design web-design-guidelines

# 仅更新全局或项目级技能
npx skills update -g
npx skills update -p

# 非交互式更新 (如果在项目目录中则自动检测为项目级，否则为全局)
npx skills update -y
```

| 选项            | 描述                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| `-g, --global`  | 仅更新全局技能                                                            |
| `-p, --project` | 仅更新项目级技能                                                          |
| `-y, --yes`     | 跳过范围提示 (自动检测: 如果在项目目录中则更新项目级，否则为全局)         |
| `[skills...]`   | 按名称更新特定技能，而不是全部更新                                        |

### `skills init`

```bash
# 在当前目录创建 SKILL.md
npx skills init

# 在子目录中创建新技能
npx skills init my-skill
```

### `skills remove`

从 Agent 中移除已安装的技能。

```bash
# 交互式移除 (从已安装的技能中进行选择)
npx skills remove

# 按名称移除特定技能
npx skills remove web-design-guidelines

# 移除多个技能
npx skills remove frontend-design web-design-guidelines

# 从全局范围移除
npx skills remove --global web-design-guidelines

# 仅从特定的 Agent 中移除
npx skills remove --agent claude-code cursor my-skill

# 在没有确认提示的情况下移除所有已安装的技能
npx skills remove --all

# 从特定的 Agent 中移除所有技能
npx skills remove --skill '*' -a cursor

# 从所有 Agent 中移除特定的技能
npx skills remove my-skill --agent '*'

# 使用 'rm' 别名
npx skills rm my-skill
```

| 选项           | 描述                                             |
| -------------- | ------------------------------------------------ |
| `-g, --global` | 从全局范围 (~/) 移除，而不是项目范围             |
| `-a, --agent`  | 从特定的 Agent 中移除 (使用 `'*'` 表示所有 Agent) |
| `-s, --skill`  | 指定要移除的技能 (使用 `'*'` 表示所有技能)       |
| `-y, --yes`    | 跳过确认提示                                     |
| `--all`        | `--skill '*' --agent '*' -y` 的简写              |

## 什么是 Agent 技能？

Agent 技能是可重用的指令集，用于扩展您的编码 Agent 的能力。它们定义在 `SKILL.md` 文件中，并通过 YAML 前言 (frontmatter) 包含 `name` 和 `description`。

技能可以让 Agent 执行特定的任务，例如：

- 从 git 历史记录生成版本发布说明
- 按照团队的规范创建 PR
- 与外部工具集成 (Linear、Notion 等)

在 **[skills.sh](https://skills.sh)** 发现更多技能。

## 支持的 Agent

技能可以安装到以下任何 Agent 中：

<!-- supported-agents:start -->
| Agent | `--agent` 参数 | 项目路径 | 全局路径 |
|-------|----------------|----------|----------|
| AiderDesk | `aider-desk` | `.aider-desk/skills/` | `~\.aider-desk\skills/` |
| Amp, Kimi Code CLI, Replit, Universal | `amp`, `kimi-cli`, `replit`, `universal` | `.agents/skills/` | `~\.config\agents\skills/` |
| Antigravity | `antigravity` | `.agents/skills/` | `~\.gemini\antigravity\skills/` |
| Augment | `augment` | `.augment/skills/` | `~\.augment\skills/` |
| IBM Bob | `bob` | `.bob/skills/` | `~\.bob\skills/` |
| Claude Code | `claude-code` | `.claude/skills/` | `~\.claude\skills/` |
| OpenClaw | `openclaw` | `skills/` | `~\.openclaw\skills/` |
| Cline, Dexto, Warp, Zed | `cline`, `dexto`, `warp`, `zed` | `.agents/skills/` | `~\.agents\skills/` |
| CodeArts Agent | `codearts-agent` | `.codeartsdoer/skills/` | `~\.codeartsdoer\skills/` |
| CodeBuddy | `codebuddy` | `.codebuddy/skills/` | `~\.codebuddy\skills/` |
| Codemaker | `codemaker` | `.codemaker/skills/` | `~\.codemaker\skills/` |
| Code Studio | `codestudio` | `.codestudio/skills/` | `~\.codestudio\skills/` |
| Codex | `codex` | `.agents/skills/` | `~\.codex\skills/` |
| Command Code | `command-code` | `.commandcode/skills/` | `~\.commandcode\skills/` |
| Continue | `continue` | `.continue/skills/` | `~\.continue\skills/` |
| Cortex Code | `cortex` | `.cortex/skills/` | `~\.snowflake\cortex\skills/` |
| Crush | `crush` | `.crush/skills/` | `~\.config\crush\skills/` |
| Cursor | `cursor` | `.agents/skills/` | `~\.cursor\skills/` |
| Deep Agents | `deepagents` | `.agents/skills/` | `~\.deepagents\agent\skills/` |
| Devin for Terminal | `devin` | `.devin/skills/` | `~\.config\devin\skills/` |
| Droid | `droid` | `.factory/skills/` | `~\.factory\skills/` |
| Firebender | `firebender` | `.agents/skills/` | `~\.firebender\skills/` |
| ForgeCode | `forgecode` | `.forge/skills/` | `~\.forge\skills/` |
| Gemini CLI | `gemini-cli` | `.agents/skills/` | `~\.gemini\skills/` |
| GitHub Copilot | `github-copilot` | `.agents/skills/` | `~\.copilot\skills/` |
| Goose | `goose` | `.goose/skills/` | `~\.config\goose\skills/` |
| Hermes Agent | `hermes-agent` | `.hermes/skills/` | `~\.hermes\skills/` |
| Junie | `junie` | `.junie/skills/` | `~\.junie\skills/` |
| iFlow CLI | `iflow-cli` | `.iflow/skills/` | `~\.iflow\skills/` |
| Kilo Code | `kilo` | `.kilocode/skills/` | `~\.kilocode\skills/` |
| Kiro CLI | `kiro-cli` | `.kiro/skills/` | `~\.kiro\skills/` |
| Kode | `kode` | `.kode/skills/` | `~\.kode\skills/` |
| MCPJam | `mcpjam` | `.mcpjam/skills/` | `~\.mcpjam\skills/` |
| Mistral Vibe | `mistral-vibe` | `.vibe/skills/` | `~\.vibe\skills/` |
| Mux | `mux` | `.mux/skills/` | `~\.mux\skills/` |
| OpenCode | `opencode` | `.agents/skills/` | `~\.config\opencode\skills/` |
| OpenHands | `openhands` | `.openhands/skills/` | `~\.openhands\skills/` |
| Pi | `pi` | `.pi/skills/` | `~\.pi\agent\skills/` |
| Qoder | `qoder` | `.qoder/skills/` | `~\.qoder\skills/` |
| Qwen Code | `qwen-code` | `.qwen/skills/` | `~\.qwen\skills/` |
| Rovo Dev | `rovodev` | `.rovodev/skills/` | `~\.rovodev\skills/` |
| Roo Code | `roo` | `.roo/skills/` | `~\.roo\skills/` |
| Tabnine CLI | `tabnine-cli` | `.tabnine/agent/skills/` | `~\.tabnine\agent\skills/` |
| Trae | `trae` | `.trae/skills/` | `~\.trae\skills/` |
| Trae CN | `trae-cn` | `.trae/skills/` | `~\.trae-cn\skills/` |
| Windsurf | `windsurf` | `.windsurf/skills/` | `~\.codeium\windsurf\skills/` |
| Zencoder | `zencoder` | `.zencoder/skills/` | `~\.zencoder\skills/` |
| Neovate | `neovate` | `.neovate/skills/` | `~\.neovate\skills/` |
| Pochi | `pochi` | `.pochi/skills/` | `~\.pochi\skills/` |
| AdaL | `adal` | `.adal/skills/` | `~\.adal\skills/` |
<!-- supported-agents:end -->

> [!NOTE]
> **Kiro CLI 用户:** 默认 Agent 会自动加载 `.kiro/skills/` 和 `~/.kiro/skills/` 中的技能，无需进行配置。如果您使用的是 **自定义 Agent**，请将技能添加到 `.kiro/agents/<agent>.json` 中的 `resources`：
>
> ```json
> {
>   "resources": ["skill://.kiro/skills/**/SKILL.md"]
> }
> ```

CLI 会自动检测您安装了哪些编码 Agent。如果未检测到任何 Agent，系统会提示您选择要安装到哪些 Agent。

## 创建技能

技能是包含具有 YAML 前言的 `SKILL.md` 文件的目录：

```markdown
---
name: my-skill
description: 该技能的作用以及何时使用它
---

# 我的技能

激活此技能时让 Agent 遵循的指令。

## 何时使用

描述应使用此技能的场景。

## 步骤

1. 首先，做这个
2. 然后，做那个
```

### 必需字段

- `name`: 唯一标识符 (小写，允许使用连字符)
- `description`: 技能作用的简要说明

### 可选字段

- `metadata.internal`: 设置为 `true` 以在常规发现中隐藏此技能。内部技能仅在设置了 `INSTALL_INTERNAL_SKILLS=1` 时可见并可安装。这对于正在开发中的技能或仅用于内部工具的技能非常有用。

```markdown
---
name: my-internal-skill
description: 默认不显示的内部技能
metadata:
  internal: true
---
```

### 技能发现

CLI 会在仓库中的以下位置搜索技能。每个技能容器目录将深入遍历一级以支持扁平布局 (`skills/<name>/SKILL.md`)，并深入遍历两级以支持目录布局 (`skills/<category>/<name>/SKILL.md`)。在较浅级别发现的 `SKILL.md` 会屏蔽其下方嵌套的同名技能。使用 `--full-depth` 还可以发现这些容器目录之外的 `SKILL.md` 文件 (例如在 `examples/` 或 `tests/` 下)。

<!-- skill-discovery:start -->
- 根目录（如果包含 `SKILL.md`）
- `skills/`
- `skills/.curated/`
- `skills/.experimental/`
- `skills/.system/`
- `.aider-desk/skills/`
- `.agents/skills/`
- `.augment/skills/`
- `.bob/skills/`
- `.claude/skills/`
- `.codeartsdoer/skills/`
- `.codebuddy/skills/`
- `.codemaker/skills/`
- `.codestudio/skills/`
- `.commandcode/skills/`
- `.continue/skills/`
- `.cortex/skills/`
- `.crush/skills/`
- `.devin/skills/`
- `.factory/skills/`
- `.forge/skills/`
- `.goose/skills/`
- `.hermes/skills/`
- `.junie/skills/`
- `.iflow/skills/`
- `.kilocode/skills/`
- `.kiro/skills/`
- `.kode/skills/`
- `.mcpjam/skills/`
- `.vibe/skills/`
- `.mux/skills/`
- `.openhands/skills/`
- `.pi/skills/`
- `.qoder/skills/`
- `.qwen/skills/`
- `.rovodev/skills/`
- `.roo/skills/`
- `.tabnine/agent/skills/`
- `.trae/skills/`
- `.windsurf/skills/`
- `.zencoder/skills/`
- `.neovate/skills/`
- `.pochi/skills/`
- `.adal/skills/`
<!-- skill-discovery:end -->

### 插件清单发现

如果存在 `.claude-plugin/marketplace.json` 或 `.claude-plugin/plugin.json`，在这些文件中声明的技能也会被发现：

```json
// .claude-plugin/marketplace.json
{
  "metadata": { "pluginRoot": "./plugins" },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "my-plugin",
      "skills": ["./skills/review", "./skills/test"]
    }
  ]
}
```

这实现了与 [Claude Code 插件市场](https://code.claude.com/docs/en/plugin-marketplaces) 生态系统的兼容性。在清单中声明的技能路径会在其声明的深度进行搜索，而不受上述深度为 2 的目录遍历的限制。

如果未在标准位置找到技能，则会进行递归搜索。

## 兼容性

技能通常在不同的 Agent 之间兼容，因为它们遵循共享的 [Agent 技能规范](https://agentskills.io)。不过，某些功能可能是特定 Agent 专有的：

| 功能            | OpenCode | OpenHands | Claude Code | Cline | CodeBuddy | Codex | Command Code | Kiro CLI | Cursor | Antigravity | Roo Code | Github Copilot | Amp | OpenClaw | Neovate | Pi  | Qoder | Zencoder |
| --------------- | -------- | --------- | ----------- | ----- | --------- | ----- | ------------ | -------- | ------ | ----------- | -------- | -------------- | --- | -------- | ------- | --- | ----- | -------- |
| 基础技能        | Yes      | Yes       | Yes         | Yes   | Yes       | Yes   | Yes          | Yes      | Yes    | Yes         | Yes      | Yes            | Yes | Yes      | Yes     | Yes | Yes   | Yes      |
| `allowed-tools` | Yes      | Yes       | Yes         | Yes   | Yes       | Yes   | Yes          | No       | Yes    | Yes         | Yes      | Yes            | Yes | Yes      | Yes     | Yes | Yes   | No       |
| `context: fork` | No       | No        | Yes         | No    | No        | No    | No           | No       | No     | No          | No       | No             | No  | No       | No      | No  | No    | No       |
| 钩子 (Hooks)    | No       | No        | Yes         | Yes   | No        | No    | No           | Yes      | No     | No          | No       | No             | No  | No       | No      | No  | No    | No       |

## 故障排除

### "No skills found" (未找到技能)

确保仓库中包含有效的 `SKILL.md` 文件，且其前言中包含 `name` 和 `description`。

### 技能未在 Agent 中加载

- 验证技能是否安装到了正确的路径
- 查看 Agent 的文档以了解技能加载的要求
- 确保 `SKILL.md` 的前言是有效的 YAML 格式

### 权限错误

确保您对目标目录具有写入权限。

## 环境变量

| 变量                      | 描述                                                                       |
| ------------------------- | -------------------------------------------------------------------------- |
| `INSTALL_INTERNAL_SKILLS` | 设置为 `1` 或 `true` 以显示并安装标记为 `internal: true` 的技能             |
| `DISABLE_TELEMETRY`       | 设置以禁用匿名使用情况遥测                                                 |
| `DO_NOT_TRACK`            | 禁用遥测的另一种方式                                                       |

```bash
# 安装内部技能
INSTALL_INTERNAL_SKILLS=1 npx skills add vercel-labs/agent-skills --list
```

## 遥测

此 CLI 收集匿名使用数据以帮助改进工具。不收集任何个人信息。

在 CI 环境中，遥测会自动禁用。

## 相关链接

- [Agent 技能规范](https://agentskills.io)
- [技能目录](https://skills.sh)
- [Amp 技能文档](https://ampcode.com/manual#agent-skills)
- [Antigravity 技能文档](https://antigravity.google/docs/skills)
- [Factory AI / Droid 技能文档](https://docs.factory.ai/cli/configuration/skills)
- [Claude Code 技能文档](https://code.claude.com/docs/en/skills)
- [OpenClaw 技能文档](https://docs.openclaw.ai/tools/skills)
- [Cline 技能文档](https://docs.cline.bot/features/skills)
- [CodeBuddy 技能文档](https://www.codebuddy.ai/docs/ide/Features/Skills)
- [Codex 技能文档](https://developers.openai.com/codex/skills)
- [Command Code 技能文档](https://commandcode.ai/docs/skills)
- [Crush 技能文档](https://github.com/charmbracelet/crush?tab=readme-ov-file#agent-skills)
- [Cursor 技能文档](https://cursor.com/docs/context/skills)
- [Firebender 技能文档](https://docs.firebender.com/multi-agent/skills)
- [Gemini CLI 技能文档](https://geminicli.com/docs/cli/skills/)
- [GitHub Copilot Agent 技能](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [iFlow CLI 技能文档](https://platform.iflow.cn/en/cli/examples/skill)
- [Kimi Code CLI 技能文档](https://moonshotai.github.io/kimi-cli/en/customization/skills.html)
- [Kiro CLI 技能文档](https://kiro.dev/docs/cli/custom-agents/configuration-reference/#skill-resources)
- [Kode 技能文档](https://github.com/shareAI-lab/kode/blob/main/docs/skills.md)
- [OpenCode 技能文档](https://opencode.ai/docs/skills)
- [Qwen Code 技能文档](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/)
- [OpenHands 技能文档](https://docs.openhands.ai/modules/usage/how-to/using-skills)
- [Pi 技能文档](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md)
- [Qoder 技能文档](https://docs.qoder.com/cli/Skills)
- [Replit 技能文档](https://docs.replit.com/replitai/skills)
- [Roo Code 技能文档](https://docs.roocode.com/features/skills)
- [Trae 技能文档](https://docs.trae.ai/ide/skills)
- [Vercel Agent 技能仓库](https://github.com/vercel-labs/agent-skills)

## 许可证

MIT
