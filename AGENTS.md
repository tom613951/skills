# AGENTS.md

此文件为处理 `skills` CLI 代码库的 AI 编码 Agent 提供指导。

## 项目概述

`skills` 是开放式 Agent 技能生态系统的命令行界面 (CLI)。

## 命令

| 命令                          | 描述                                                |
| ----------------------------- | --------------------------------------------------- |
| `skills`                      | 显示包含可用命令的横幅                              |
| `skills add <pkg>`            | 从 git 仓库、URL 或本地路径安装技能                 |
| `skills experimental_install` | 从 skills-lock.json 恢复技能                        |
| `skills experimental_sync`    | 将技能从 node_modules 同步到 Agent 目录             |
| `skills list`                 | 列出已安装的技能 (别名: `ls`)                       |
| `skills update [skills...]`   | 将技能更新到最新版本                                |
| `skills init [name]`          | 创建一个新的 SKILL.md 模板                          |

别名：`skills a` 适用于 `add`。在无参数时，`skills i` 和 `skills install` 会从 `skills-lock.json` 恢复。`skills ls` 适用于 `list`。`skills experimental_install` 会从 `skills-lock.json` 恢复。`skills experimental_sync` 会在 `node_modules` 中搜寻技能。

## 架构

```
src/
├── cli.ts           # 主入口点，命令路由，init/check/update
├── cli.test.ts      # CLI 测试
├── add.ts           # 核心 add 命令逻辑
├── add-prompt.test.ts # add 提示行为测试
├── add.test.ts      # add 命令测试
├── constants.ts      # 共享常量
├── find.ts           # find/search 命令
├── list.ts          # 列出已安装技能命令
├── list.test.ts     # list 命令测试
├── remove.ts         # remove 命令实现
├── remove.test.ts    # remove 命令测试
├── agents.ts        # Agent 定义与检测
├── installer.ts     # 技能安装逻辑 (软链接/复制) + listInstalledSkills
├── skills.ts        # 技能发现与解析
├── skill-lock.ts    # 全局锁文件管理 (~/.agents/.skill-lock.json)
├── local-lock.ts    # 本地锁文件管理 (skills-lock.json，已提交)
├── sync.ts          # sync 命令 - 在 node_modules 中搜寻技能
├── source-parser.ts # 解析 git URL、GitHub 简写、本地路径
├── git.ts           # Git 克隆操作
├── telemetry.ts     # 匿名使用情况跟踪
├── types.ts         # TypeScript 类型定义
├── mintlify.ts      # Mintlify 技能获取 (遗留)
├── plugin-manifest.ts # 插件清单发现支持
├── prompts/         # 交互式提示辅助工具
│   └── search-multiselect.ts
├── providers/       # 远程技能提供商 (GitHub, HuggingFace, Mintlify)
│   ├── index.ts
│   ├── registry.ts
│   ├── types.ts
│   ├── huggingface.ts
│   ├── mintlify.ts
│   └── wellknown.ts
├── init.test.ts     # init 命令测试
└── test-utils.ts    # 测试实用工具

tests/
├── cross-platform-paths.test.ts # 跨平台路径规范化测试
├── full-depth-discovery.test.ts # --full-depth 技能发现测试
├── openclaw-paths.test.ts       # OpenClaw 特有路径测试
├── plugin-manifest-discovery.test.ts # 插件清单技能发现测试
├── sanitize-name.test.ts     # sanitizeName 测试 (防止路径遍历)
├── skill-matching.test.ts    # filterSkills 测试 (多单词技能名称匹配)
├── source-parser.test.ts     # URL/路径解析测试
├── installer-symlink.test.ts # 软链接安装测试
├── list-installed.test.ts    # 列出已安装技能测试
├── skill-path.test.ts        # 技能路径处理测试
├── wellknown-provider.test.ts # 常见提供商测试
├── xdg-config-paths.test.ts   # XDG 全局路径处理测试
└── dist.test.ts               # 构建发布包的测试
```

## 更新检查系统

### `skills check` 和 `skills update` 的工作原理

1. 读取 `~/.agents/.skill-lock.json` 以获取已安装的技能
2. 筛选出同时具有 `skillFolderHash` 和 `skillPath` 的 GitHub 备份技能
3. 对于每个技能，调用 `fetchSkillFolderHash(source, skillPath, token)`。可选的身份验证令牌从 `GITHUB_TOKEN`、`GH_TOKEN` 或 `gh auth token` 中获取，以提高速率限制。
4. `fetchSkillFolderHash` 直接调用 GitHub Trees API (`/git/trees/<branch>?recursive=1` 针对 `main`，然后是 `master` 的回退机制)
5. 比较最新的文件夹树 SHA 与锁文件中的 `skillFolderHash`；不匹配则意味着有更新可用
6. `skills update` 通过直接调用当前的 CLI 入口点来重新安装发生变更的技能 (`node <repo>/bin/cli.mjs add <source-tree-url> -g -y`)，以避免嵌套的 npm exec/npx 行为

### 锁文件兼容性

锁文件格式版本为 v3。关键字段为 `skillFolderHash` (技能文件夹的 GitHub 树 SHA)。

如果读取到较旧版本的锁文件，它将被清除。用户必须重新安装技能以生成新格式的数据。

## 关键集成点

| 功能                       | 实现位置                                                      |
| -------------------------- | ------------------------------------------------------------- |
| `skills add`               | `src/add.ts` - 完整实现                                       |
| `skills experimental_sync` | `src/sync.ts` - 搜寻 node_modules                             |
| `skills check`             | `src/cli.ts` + `src/skill-lock.ts` 中的 `fetchSkillFolderHash`|
| `skills update`            | `src/cli.ts` 直接进行哈希对比 + 通过 `skills add` 重新安装    |

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 本地测试
pnpm dev add vercel-labs/agent-skills --list
pnpm dev experimental_sync
pnpm dev check
pnpm dev update
pnpm dev init my-skill

# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test tests/sanitize-name.test.ts
pnpm test tests/skill-matching.test.ts tests/source-parser.test.ts

# 类型检查
pnpm type-check

# 格式化代码
pnpm format

# 检查代码格式
pnpm format:check

# 验证并同步 Agent 元数据/文档
pnpm run -C scripts validate-agents.ts
pnpm run -C scripts sync-agents.ts
```

## 代码样式

本项目使用 Prettier 进行代码格式化。**在提交更改之前，请务必运行 `pnpm format`** 以确保代码格式一致。

```bash
# 格式化所有文件
pnpm format

# 仅检查格式，不进行修复
pnpm format:check
```

如果代码格式不正确，CI 将会失败。

## 发布

```bash
# 1. 修改 package.json 中的版本号
# 2. 构建
pnpm build
# 3. 发布
npm publish
```

## 添加新 Agent

1. 在 `src/agents.ts` 中添加 Agent 定义
2. 运行 `pnpm run -C scripts validate-agents.ts` 进行验证
3. 运行 `pnpm run -C scripts sync-agents.ts` 以更新 README.md 和 package 关键字
