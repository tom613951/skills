---
name: find-skills
description: 帮助用户发现并安装 Agent 技能。当用户提出类似于“如何执行 X”、“寻找 X 技能”、“有没有能做 X 的技能……”等问题，或表示出扩展能力的意向时，可以使用此技能。当用户寻找可能以可安装技能形式存在的功能时，应使用此技能。
---

# 寻找技能

此技能可帮助您从开放式 Agent 技能生态系统中发现并安装技能。

## 何时使用此技能

当用户出现以下情况时，使用此技能：

- 询问“如何执行 X”，其中 X 可能是已有技能可以完成的常规任务
- 说“寻找 X 的技能”或“是否有 X 的技能”
- 询问“你能否做 X”，其中 X 是一种专业能力
- 表示对扩展 Agent 能力感兴趣
- 想要搜索工具、模板或工作流
- 提到他们希望在特定领域（设计、测试、部署等）获得帮助

## 什么是 Skills CLI？

Skills CLI (`npx skills`) 是开放式 Agent 技能生态系统的包管理器。技能是模块化的包，可通过专业知识、工作流和工具来扩展 Agent 的能力。

**关键命令：**

- `npx skills find [query]` - 交互式或通过关键字搜索技能
- `npx skills add <package>` - 从 GitHub 或其他来源安装技能
- `npx skills check` - 检查技能更新
- `npx skills update` - 更新所有已安装的技能

**浏览技能网站：** https://skills.sh/

## 如何帮助用户寻找技能

### 步骤 1：理解他们的需求

当用户寻求帮助时，请确认：

1. 领域（例如，React、测试、设计、部署）
2. 具体任务（例如，编写测试、创建动画、审查 PR）
3. 这是否是一个非常常见的任务，以至于很可能已经存在相应的技能

### 步骤 2：先检查排行榜

在运行 CLI 搜索之前，先检查 [skills.sh 排行榜](https://skills.sh/)，看是否已有该领域知名度较高的技能。排行榜按总安装量对技能进行排序，能够直观地展示最受欢迎且经过实战检验的选项。

例如，Web 开发的顶级技能包括：
- `vercel-labs/agent-skills` — React, Next.js, 网页设计 (均超过 100K+ 安装量)
- `anthropics/skills` — 前端设计, 文档处理 (100K+ 安装量)

### 步骤 3：搜索技能

如果排行榜没有涵盖用户的需求，请运行 find 命令：

```bash
npx skills find [query]
```

例如：

- 用户问“如何让我的 React 应用变快？” → `npx skills find react performance`
- 用户问“你能帮我审查 PR 吗？” → `npx skills find pr review`
- 用户问“我需要生成一份变更日志” → `npx skills find changelog`

### 步骤 4：在推荐前验证质量

**请勿仅仅根据搜索结果推荐技能。** 务必验证：

1. **安装量** — 优先推荐安装量 1K+ 的技能。对于安装量低于 100 的技能请保持谨慎。
2. **来源信誉** — 官方来源（`vercel-labs`、`anthropics`、`microsoft`）比未知作者更值得信赖。
3. **GitHub Star 数** — 检查源仓库。来自 Star 数少于 100 的仓库的技能应持怀疑态度。

### 步骤 5：向用户展示选项

找到相关技能后，向用户展示以下内容：

1. 技能名称及其作用
2. 安装量和来源
3. 他们可以运行的安装命令
4. 在 skills.sh 上了解更多的链接

示例回复：

```
我找到了一个可能对您有帮助的技能！"react-best-practices" 技能提供了
来自 Vercel 工程团队的 React 和 Next.js 性能优化指南。
(18.5万次安装)

安装命令：
npx skills add vercel-labs/agent-skills@react-best-practices

了解更多：https://skills.sh/vercel-labs/agent-skills/react-best-practices
```

### 步骤 6：主动提供安装服务

如果用户想要继续，您可以帮他们安装技能：

```bash
npx skills add <owner/repo@skill> -g -y
```

`-g` 标志表示全局安装（用户级），`-y` 表示跳过所有确认提示。

## 常见技能类别

搜索时，可以考虑以下常见类别：

| 类别            | 示例查询                                 |
| --------------- | ---------------------------------------- |
| Web 开发        | react, nextjs, typescript, css, tailwind |
| 测试            | testing, jest, playwright, e2e           |
| DevOps          | deploy, docker, kubernetes, ci-cd        |
| 文档编写        | docs, readme, changelog, api-docs        |
| 代码质量        | review, lint, refactor, best-practices   |
| 设计            | ui, ux, design-system, accessibility     |
| 生产力          | workflow, automation, git                |

## 高效搜索的技巧

1. **使用具体的关键字**：“react testing” 比单纯的 “testing” 更好
2. **尝试替换词**：如果“deploy”没有结果，可以试试“deployment”或“ci-cd”
3. **检查热门来源**：许多技能来自 `vercel-labs/agent-skills` 或 `ComposioHQ/awesome-claude-skills`

## 未找到技能时的处理

如果不存在相关的技能：

1. 承认未找到现有匹配的技能
2. 主动提供直接使用您的通用能力来完成该任务
3. 建议用户可以使用 `npx skills init` 创建自己的技能

示例：

```
我搜索了与“xyz”相关的技能，但没有找到匹配项。
不过我仍能直接帮助您完成这项任务！您希望我开始吗？

如果这是您经常做的事情，您也可以创建自己的技能：
npx skills init my-xyz-skill
```
