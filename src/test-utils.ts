import { execSync } from 'child_process';
import { join } from 'path';
import { stripTerminalEscapes } from './sanitize.ts';

// const PROJECT_ROOT = join(import.meta.dirname, '..');
const CLI_PATH = join(import.meta.dirname, 'cli.ts');

export function stripAnsi(str: string): string {
  return stripTerminalEscapes(str);
}

export function stripLogo(str: string): string {
  return str
    .split('\n')
    .filter((line) => !line.includes('███') && !line.includes('╔') && !line.includes('╚'))
    .join('\n')
    .replace(/^\n+/, '');
}

export function hasLogo(str: string): boolean {
  return str.includes('███') || str.includes('╔') || str.includes('╚');
}

export function runCli(
  args: string[],
  cwd?: string,
  env?: Record<string, string>,
  timeout?: number
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const baseEnv = { ...process.env };
    // Clear agent-detection env vars so CLI tests run in standard non-agent mode
    for (const key of Object.keys(baseEnv)) {
      if (
        key.startsWith('ANTIGRAVITY') ||
        key.startsWith('CLAUDE') ||
        key.startsWith('CURSOR') ||
        key.startsWith('AIDER') ||
        key.startsWith('COWORK') ||
        key.startsWith('GEMINI') ||
        key.startsWith('VSCODE')
      ) {
        delete baseEnv[key];
      }
    }
    const output = execSync(`node "${CLI_PATH}" ${args.join(' ')}`, {
      encoding: 'utf-8',
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: env ? { ...baseEnv, ...env } : baseEnv,
      timeout: timeout ?? 30000,
    });
    return { stdout: stripAnsi(output), stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: stripAnsi(error.stdout || ''),
      stderr: stripAnsi(error.stderr || ''),
      exitCode: error.status || 1,
    };
  }
}

export function runCliOutput(args: string[], cwd?: string): string {
  const result = runCli(args, cwd);
  return result.stdout || result.stderr;
}

export function runCliWithInput(
  args: string[],
  input: string,
  cwd?: string
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const baseEnv = { ...process.env };
    for (const key of Object.keys(baseEnv)) {
      if (
        key.startsWith('ANTIGRAVITY') ||
        key.startsWith('CLAUDE') ||
        key.startsWith('CURSOR') ||
        key.startsWith('AIDER') ||
        key.startsWith('COWORK') ||
        key.startsWith('GEMINI') ||
        key.startsWith('VSCODE')
      ) {
        delete baseEnv[key];
      }
    }
    const output = execSync(`node "${CLI_PATH}" ${args.join(' ')}`, {
      encoding: 'utf-8',
      cwd,
      input: input + '\n',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: baseEnv,
    });
    return { stdout: stripAnsi(output), stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: stripAnsi(error.stdout || ''),
      stderr: stripAnsi(error.stderr || ''),
      exitCode: error.status || 1,
    };
  }
}
