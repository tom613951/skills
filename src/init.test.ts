import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runCliOutput, stripLogo } from './test-utils.ts';

describe('init command', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `skills-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should initialize a skill and create SKILL.md', () => {
    const output = stripLogo(runCliOutput(['init', 'my-test-skill'], testDir));
    expect(output).toMatchInlineSnapshot(`
      "初始化技能：my-test-skill

      已创建：
        my-test-skill/SKILL.md

      后续步骤：
        1. 编辑 my-test-skill/SKILL.md 来定义技能指令
        2. 更新前言 (frontmatter) 中的 name 和 description

      发布方法：
        GitHub:  推送到仓库，然后执行 npx skills add <所有者>/<仓库>
        URL:     托管该文件，然后执行 npx skills add https://example.com/my-test-skill/SKILL.md

      访问 https://skills.sh/ 浏览现有技能以获取灵感

      "
    `);

    const skillPath = join(testDir, 'my-test-skill', 'SKILL.md');
    expect(existsSync(skillPath)).toBe(true);

    const content = readFileSync(skillPath, 'utf-8');
    expect(content).toMatchInlineSnapshot(`
      "---
      name: my-test-skill
      description: 简要描述该技能的作用
      ---

      # my-test-skill

      激活此技能时让 Agent 遵循的指令。

      ## 何时使用

      描述何时应该使用此技能。

      ## 指令

      1. 第一步
      2. 第二步
      3. 视需要添加更多步骤
      "
    `);
  });

  it('should allow multiple skills in same directory', () => {
    runCliOutput(['init', 'hydration-fix'], testDir);
    runCliOutput(['init', 'waterfall-data-fetching'], testDir);

    expect(existsSync(join(testDir, 'hydration-fix', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(testDir, 'waterfall-data-fetching', 'SKILL.md'))).toBe(true);
  });

  it('should init SKILL.md in cwd when no name provided', () => {
    const output = stripLogo(runCliOutput(['init'], testDir));

    expect(output).toContain('初始化技能：');
    expect(output).toContain('已创建：\n  SKILL.md'); // directly in cwd, not in a subfolder
    expect(output).toContain('发布方法：');
    expect(output).toContain('GitHub:');
    expect(output).toContain('npx skills add <所有者>/<仓库>');
    expect(output).toContain('URL:');
    expect(output).toContain('npx skills add https://example.com/SKILL.md');
    expect(existsSync(join(testDir, 'SKILL.md'))).toBe(true);
  });

  it('should show publishing hints with skill path', () => {
    const output = stripLogo(runCliOutput(['init', 'my-skill'], testDir));

    expect(output).toContain('发布方法：');
    expect(output).toContain('GitHub:  推送到仓库，然后执行 npx skills add <所有者>/<仓库>');
    expect(output).toContain(
      'URL:     托管该文件，然后执行 npx skills add https://example.com/my-skill/SKILL.md'
    );
  });

  it('should show error if skill already exists', () => {
    runCliOutput(['init', 'existing-skill'], testDir);
    const output = stripLogo(runCliOutput(['init', 'existing-skill'], testDir));
    expect(output).toMatchInlineSnapshot(`
      "技能已存在于 existing-skill/SKILL.md
      "
    `);
  });
});
