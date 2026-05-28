#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runAdd, parseAddOptions, initTelemetry } from './add.ts';
import { runFind } from './find.ts';
import { runInstallFromLock } from './install.ts';
import { runList } from './list.ts';
import { removeCommand, parseRemoveOptions } from './remove.ts';
import { runSync, parseSyncOptions } from './sync.ts';
import { flushTelemetry } from './telemetry.ts';
import { isRunningInAgent } from './detect-agent.ts';
import { runUpdate } from './update.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getVersion(): string {
  try {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

const VERSION = getVersion();
initTelemetry(VERSION);

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
// 256-color grays - visible on both light and dark backgrounds
const DIM = '\x1b[38;5;102m'; // darker gray for secondary text
const TEXT = '\x1b[38;5;145m'; // lighter gray for primary text

const LOGO_LINES = [
  '███████╗██╗  ██╗██╗██╗     ██╗     ███████╗',
  '██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝',
  '███████╗█████╔╝ ██║██║     ██║     ███████╗',
  '╚════██║██╔═██╗ ██║██║     ██║     ╚════██║',
  '███████║██║  ██╗██║███████╗███████╗███████║',
  '╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝',
];

// 256-color middle grays - visible on both light and dark backgrounds
const GRAYS = [
  '\x1b[38;5;250m', // lighter gray
  '\x1b[38;5;248m',
  '\x1b[38;5;245m', // mid gray
  '\x1b[38;5;243m',
  '\x1b[38;5;240m',
  '\x1b[38;5;238m', // darker gray
];

function showLogo(): void {
  console.log();
  LOGO_LINES.forEach((line, i) => {
    console.log(`${GRAYS[i]}${line}${RESET}`);
  });
}

function showBanner(): void {
  showLogo();
  console.log();
  console.log(`${DIM}开放式 Agent 技能生态系统${RESET}`);
  console.log();
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills add ${DIM}<package>${RESET}        ${DIM}添加新技能${RESET}`
  );
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills remove${RESET}               ${DIM}移除已安装的技能${RESET}`
  );
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills list${RESET}                 ${DIM}列出已安装的技能${RESET}`
  );
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills find ${DIM}[query]${RESET}         ${DIM}搜索技能${RESET}`
  );
  console.log();
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills update${RESET}               ${DIM}更新已安装的技能${RESET}`
  );
  console.log();
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills experimental_install${RESET} ${DIM}从 skills-lock.json 恢复技能${RESET}`
  );
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills init ${DIM}[name]${RESET}          ${DIM}新建技能${RESET}`
  );
  console.log(
    `  ${DIM}$${RESET} ${TEXT}npx skills experimental_sync${RESET}    ${DIM}从 node_modules 同步技能${RESET}`
  );
  console.log();
  console.log(`${DIM}尝试：${RESET} npx skills add vercel-labs/agent-skills`);
  console.log();
  console.log(`发现更多技能请访问 ${TEXT}https://lively-pythagoras.vercel.app/${RESET}`);
  console.log();
}

function showHelp(): void {
  console.log(`
${BOLD}用法：${RESET} skills <command> [options]

${BOLD}管理技能：${RESET}
  add <package>        添加技能包 (别名: a)
                       例如 vercel-labs/agent-skills
                            https://github.com/vercel-labs/agent-skills
  remove [skills]      移除已安装的技能 (别名: rm)
  list, ls             列出已安装的技能
  find [query]         交互式搜索技能 (别名: f)

${BOLD}更新：${RESET}
  update [skills...]   更新技能到最新版本 (别名: upgrade, check)

${BOLD}更新选项：${RESET}
  -g, --global           仅更新全局技能
  -p, --project          仅更新项目级技能
  -y, --yes              跳过范围提示 (自动检测: 如果在项目目录中则为项目级，否则为全局)

${BOLD}项目命令：${RESET}
  experimental_install 从 skills-lock.json 恢复技能
  init [name]          初始化新技能 (创建 <name>/SKILL.md 或 ./SKILL.md)
  experimental_sync    从 node_modules 同步技能到 Agent 目录

${BOLD}添加选项：${RESET}
  -g, --global           全局 (用户级) 安装技能，而不是项目级
  -a, --agent <agents>   指定安装的目标 Agent (使用 '*' 表示所有 Agent)
  -s, --skill <skills>   指定安装的特定技能名称 (使用 '*' 表示所有技能)
  -l, --list             仅列出仓库中可用的技能而不进行安装
  -y, --yes              跳过所有确认提示
  --copy                 将文件复制到 Agent 目录，而不是建立软链接
  --all                  --skill '*' --agent '*' -y 的简写
  --full-depth           即使根目录存在 SKILL.md 也搜索所有子目录

${BOLD}移除选项：${RESET}
  -g, --global           从全局范围移除
  -a, --agent <agents>   从特定 Agent 中移除 (使用 '*' 表示所有 Agent)
  -s, --skill <skills>   指定要移除的技能 (使用 '*' 表示所有技能)
  -y, --yes              跳过确认提示
  --all                  --skill '*' --agent '*' -y 的简写
  
${BOLD}同步选项 (实验性)：${RESET}
  -a, --agent <agents>   指定安装的目标 Agent (使用 '*' 表示所有 Agent)
  -y, --yes              跳过确认提示

${BOLD}列表选项：${RESET}
  -g, --global           列出全局技能 (默认: 项目级)
  -a, --agent <agents>   按特定 Agent 进行筛选
  --json                 输出为 JSON 格式 (机器可读，无 ANSI 颜色)

${BOLD}全局选项：${RESET}
  --help, -h        显示此帮助信息
  --version, -v     显示版本号

${BOLD}示例：${RESET}
  ${DIM}$${RESET} skills add vercel-labs/agent-skills
  ${DIM}$${RESET} skills add vercel-labs/agent-skills -g
  ${DIM}$${RESET} skills add vercel-labs/agent-skills --agent claude-code cursor
  ${DIM}$${RESET} skills add vercel-labs/agent-skills --skill pr-review commit
  ${DIM}$${RESET} skills remove                        ${DIM}# 交互式移除${RESET}
  ${DIM}$${RESET} skills remove web-design             ${DIM}# 按名称移除${RESET}
  ${DIM}$${RESET} skills rm --global frontend-design
  ${DIM}$${RESET} skills list                          ${DIM}# 列出项目级技能${RESET}
  ${DIM}$${RESET} skills ls -g                         ${DIM}# 列出全局技能${RESET}
  ${DIM}$${RESET} skills ls -a claude-code             ${DIM}# 按 Agent 筛选${RESET}
  ${DIM}$${RESET} skills ls --json                      ${DIM}# 输出为 JSON${RESET}
  ${DIM}$${RESET} skills find                          ${DIM}# 交互式搜索${RESET}
  ${DIM}$${RESET} skills find typescript               ${DIM}# 按关键字搜索${RESET}
  ${DIM}$${RESET} skills update
  ${DIM}$${RESET} skills update my-skill             ${DIM}# 更新单个技能${RESET}
  ${DIM}$${RESET} skills update -g                    ${DIM}# 仅更新全局技能${RESET}
  ${DIM}$${RESET} skills experimental_install            ${DIM}# 从 lock 恢复${RESET}
  ${DIM}$${RESET} skills init my-skill
  ${DIM}$${RESET} skills experimental_sync              ${DIM}# 从 node_modules 同步${RESET}
  ${DIM}$${RESET} skills experimental_sync -y           ${DIM}# 同步且不进行提示${RESET}

发现更多技能请访问 ${TEXT}https://lively-pythagoras.vercel.app/${RESET}
`);
}

function showRemoveHelp(): void {
  console.log(`
${BOLD}用法：${RESET} skills remove [skills...] [options]

${BOLD}描述：${RESET}
  从 Agent 中移除已安装的技能。如果未提供技能名称，
  则会显示交互式选择菜单。

${BOLD}参数：${RESET}
  skills            可选。要移除的技能名称 (空格分隔)

${BOLD}选项：${RESET}
  -g, --global       从全局范围 (~/) 移除，而不是项目范围
  -a, --agent        从特定 Agent 移除 (使用 '*' 表示所有 Agent)
  -s, --skill        指定要移除的技能 (使用 '*' 表示所有技能)
  -y, --yes          跳过确认提示
  --all              --skill '*' --agent '*' -y 的简写

${BOLD}示例：${RESET}
  ${DIM}$${RESET} skills remove                           ${DIM}# 交互式选择移除${RESET}
  ${DIM}$${RESET} skills remove my-skill                   ${DIM}# 移除特定技能${RESET}
  ${DIM}$${RESET} skills remove skill1 skill2 -y           ${DIM}# 移除多个技能${RESET}
  ${DIM}$${RESET} skills remove --global my-skill          ${DIM}# 从全局范围移除${RESET}
  ${DIM}$${RESET} skills rm --agent claude-code my-skill   ${DIM}# 从特定 Agent 移除${RESET}
  ${DIM}$${RESET} skills remove --all                      ${DIM}# 移除所有技能${RESET}
  ${DIM}$${RESET} skills remove --skill '*' -a cursor      ${DIM}# 移除 cursor 中的所有技能${RESET}

发现更多技能请访问 ${TEXT}https://lively-pythagoras.vercel.app/${RESET}
`);
}

function runInit(args: string[]): void {
  const cwd = process.cwd();
  const skillName = args[0] || basename(cwd);
  const hasName = args[0] !== undefined;

  const skillDir = hasName ? join(cwd, skillName) : cwd;
  const skillFile = join(skillDir, 'SKILL.md');
  const displayPath = hasName ? `${skillName}/SKILL.md` : 'SKILL.md';

  if (existsSync(skillFile)) {
    console.log(`${TEXT}技能已存在于 ${DIM}${displayPath}${RESET}`);
    return;
  }

  if (hasName) {
    mkdirSync(skillDir, { recursive: true });
  }

  const skillContent = `---
name: ${skillName}
description: 简要描述该技能的作用
---

# ${skillName}

激活此技能时让 Agent 遵循的指令。

## 何时使用

描述何时应该使用此技能。

## 指令

1. 第一步
2. 第二步
3. 视需要添加更多步骤
`;

  writeFileSync(skillFile, skillContent);

  console.log(`${TEXT}初始化技能：${DIM}${skillName}${RESET}`);
  console.log();
  console.log(`${DIM}已创建：${RESET}`);
  console.log(`  ${displayPath}`);
  console.log();
  console.log(`${DIM}后续步骤：${RESET}`);
  console.log(`  1. 编辑 ${TEXT}${displayPath}${RESET} 来定义技能指令`);
  console.log(`  2. 更新前言 (frontmatter) 中的 ${TEXT}name${RESET} 和 ${TEXT}description${RESET}`);
  console.log();
  console.log(`${DIM}发布方法：${RESET}`);
  console.log(
    `  ${DIM}GitHub:${RESET}  推送到仓库，然后执行 ${TEXT}npx skills add <所有者>/<仓库>${RESET}`
  );
  console.log(
    `  ${DIM}URL:${RESET}     托管该文件，然后执行 ${TEXT}npx skills add https://example.com/${displayPath}${RESET}`
  );
  console.log();
  console.log(`访问 ${TEXT}https://lively-pythagoras.vercel.app/${RESET} 浏览现有技能以获取灵感`);
  console.log();
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const inAgent = await isRunningInAgent();

  if (args.length === 0) {
    if (!inAgent) {
      showBanner();
    }
    return;
  }

  const command = args[0];
  const restArgs = args.slice(1);

  switch (command) {
    case 'find':
    case 'search':
    case 'f':
    case 's':
      if (!inAgent) showLogo();
      console.log();
      await runFind(restArgs);
      break;
    case 'init':
      if (!inAgent) showLogo();
      console.log();
      runInit(restArgs);
      break;
    case 'experimental_install': {
      if (!inAgent) showLogo();
      await runInstallFromLock(restArgs);
      break;
    }
    case 'i':
    case 'install':
    case 'a':
    case 'add': {
      if (!inAgent) showLogo();
      const { source: addSource, options: addOpts } = parseAddOptions(restArgs);
      await runAdd(addSource, addOpts);
      break;
    }
    case 'remove':
    case 'rm':
    case 'r':
      // Check for --help or -h flag
      if (restArgs.includes('--help') || restArgs.includes('-h')) {
        showRemoveHelp();
        break;
      }
      const { skills, options: removeOptions } = parseRemoveOptions(restArgs);
      await removeCommand(skills, removeOptions);
      break;
    case 'experimental_sync': {
      if (!inAgent) showLogo();
      const { options: syncOptions } = parseSyncOptions(restArgs);
      await runSync(restArgs, syncOptions);
      break;
    }
    case 'list':
    case 'ls':
      await runList(restArgs);
      break;
    case 'check':
    case 'update':
    case 'upgrade':
      await runUpdate(restArgs);
      break;
    case '--help':
    case '-h':
      showHelp();
      break;
    case '--version':
    case '-v':
      console.log(VERSION);
      break;

    default:
      console.log(`未知命令：${command}`);
      console.log(`运行 ${BOLD}skills --help${RESET} 查看用法。`);
  }
}

main().finally(() => flushTelemetry().then(() => process.exit(0)));
